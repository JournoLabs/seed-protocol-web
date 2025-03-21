import { Model, Text, Image, List } from '@seedprotocol/sdk'


@Model
class Post {  @Text() title!: string
  @Text() summary!: string
  @Image() featureImage!: string
  @Text('ItemStorage', '/html', '.html') html!: string
  @Text('ItemStorage', '/json', '.json') json!: string
  @Text() storageTransactionId!: string
  @List('Identity') authors!: string[]
  @Text() importUrl!: string
}


@Model
class Identity {  @Text() name!: string
  @Text() profile!: string
  @Text() displayName!: string
  @Image() avatarImage!: string
  @Image() coverImage!: string
}


@Model
class Link {  @Text() url!: string
  @Text() text!: string
}


const models = {  Post,
  Identity,
  Link,
}

const endpoints = {
  filePaths: '/api/seed/migrations',
  files: '/app-files',
}


const arweaveDomain = 'arweave.net'

export { models, endpoints, arweaveDomain }

export default { models, endpoints, arweaveDomain }

