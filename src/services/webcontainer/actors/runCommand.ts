import { EventObject, fromCallback }                                 from 'xstate'
import { FromCallbackInput, WebContainerContext, WebContainerEvent } from '../../../types/services.ts'
import { eventEmitter }                                              from '../../../helpers/events.ts'

export const runCommand = fromCallback<
  EventObject,
  FromCallbackInput<WebContainerContext, WebContainerEvent>
>(({ sendBack, input: {context, event} }) => {

  if (!event || event.type !== 'RUN_COMMAND' || !event.command) {
    throw new Error('Command not provided')
  }

  const command = event.command

  const _runCommand = async () => {
      const webContainer = context.webcontainer

  if (!webContainer) {
    throw new Error('WebContainer not initialized')
  }

  try {

    const commandDisplay = `\x1b[1;32m> ${command}\x1b[0m\r\n`;

    // Emit the command being executed to the terminal
    eventEmitter.emit('output', commandDisplay);

    const outputStream = new WritableStream()

    // Send the command being executed to the output stream
    const writer = outputStream.getWriter();
    await writer.write({ stdout: commandDisplay });
    writer.releaseLock();

    // Spawn the process in the container
    const process = await webContainer.spawn(command, [], {});

    // Set up piping the process output
    const textDecoder = new TextDecoder();

    process.output.pipeTo(
      new WritableStream({
        write: async (chunk) => {
          const text = typeof chunk === 'string' ? chunk : textDecoder.decode(chunk);

          // Make sure we have proper line endings for the terminal
          const formattedText = text.endsWith('\n') || text.endsWith('\r') ? text : text + '\r\n';

          // Also emit the output for listeners
          eventEmitter.emit('output', formattedText);
        }
      })
    );

    // Wait for the process to exit and return its exit code
    const exitCode = await process.exit;

    // Emit the exit code
    const exitMessage = exitCode === 0
      ? `\x1b[1;32mCommand '${command}' completed with exit code ${exitCode}\x1b[0m\r\n`
      : `\x1b[1;31mCommand '${command}' failed with exit code ${exitCode}\x1b[0m\r\n`;

    eventEmitter.emit('output', exitMessage);

    return exitCode;
  } catch (error) {
    console.error(`Error executing command "${command}":`, error);

    // Format the error message
    const errorMessage = `\x1b[1;31mFailed to execute command: ${command}\n${error}\x1b[0m\r\n`;

    // Write the error to our output stream
    const writer = new WritableStream().getWriter();
    await writer.write({ stderr: errorMessage });
    writer.releaseLock();

    // Also emit the error
    eventEmitter.emit('output', errorMessage);

    return 1; // Return non-zero exit code to indicate failure
  }
  }

  _runCommand().then((exitCode) => {
    if (exitCode === 0) {
      sendBack({type: 'COMMAND_COMPLETE'})
    }

    if (exitCode !== 0) {
      sendBack({type: 'COMMAND_ERROR'})
    }
  })
})
