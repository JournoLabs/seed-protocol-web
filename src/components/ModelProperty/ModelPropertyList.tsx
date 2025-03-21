import { FC, useEffect, useRef, useState } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from 'handsontable/registry';
import type { CellChange, ChangeSource } from 'handsontable/common';
import { models } from "../../../schema";
import { PropertyType } from "../../types/modelProperties";
import 'handsontable/dist/handsontable.full.min.css';
import '../../../src/styles/handsontable.tailwind.theme.css';
import debug from "debug";

// Register Handsontable modules
registerAllModules();

const logger = debug('seedWeb:components:ModelPropertyList');

// Available property types from your existing types
const PROPERTY_TYPES: PropertyType[] = [
  'Text',
  'Relation',
  'List',
  'Image',
  'Json',
  'Html',
  'Number',
  'Boolean',
  'Date'
];

interface PropertyData {
  name: string;
  dataType: PropertyType;
  required: boolean;
  storageType: string;
  path: string;
  filenameSuffix: string;
  ref: string;
}

interface ModelSchema {
  schema: {
    [key: string]: {
      dataType: PropertyType;
      required?: boolean;
      storageType?: string;
      path?: string;
      filenameSuffix?: string;
      ref?: string;
    };
  };
}

const ModelPropertyList: FC<{ modelName: string }> = ({ modelName }) => {
  const hotRef = useRef(null);
  const ModelClass = models[modelName as keyof typeof models] as unknown as ModelSchema;
  const [data, setData] = useState<PropertyData[]>([]);

  useEffect(() => {
    // Convert schema properties to array format for Handsontable
    const properties = Object.entries(ModelClass.schema).map(([propertyName, property]) => ({
      name: propertyName,
      dataType: property.dataType,
      required: property.required || false,
      storageType: property.storageType || '',
      path: property.path || '',
      filenameSuffix: property.filenameSuffix || '',
      ref: property.ref || ''
    }));
    setData(properties);
  }, [ModelClass.schema]);

  const columns = [
    {
      data: 'name',
      title: 'Property Name',
      width: 150,
      className: 'htMiddle'
    },
    {
      data: 'dataType',
      title: 'Type',
      type: 'dropdown',
      source: PROPERTY_TYPES,
      width: 100,
      className: 'htMiddle'
    },
    {
      data: 'required',
      title: 'Required',
      type: 'checkbox',
      width: 80,
      className: 'htCenter htMiddle'
    },
    {
      data: 'storageType',
      title: 'Storage Type',
      width: 120,
      className: 'htMiddle'
    },
    {
      data: 'path',
      title: 'Path',
      width: 120,
      className: 'htMiddle',
      wordWrap: true
    },
    {
      data: 'filenameSuffix',
      title: 'Filename Suffix',
      width: 120,
      className: 'htMiddle'
    },
    {
      data: 'ref',
      title: 'Reference Model',
      width: 120,
      className: 'htMiddle'
    }
  ];

  const handleAfterChange = (changes: CellChange[] | null, source: ChangeSource) => {
    if (!changes) return;
    
    logger('Data changed:', changes, 'Source:', source);
    // Here you would implement the logic to update the model schema
    // This is where you'd sync changes back to your model
  };

  return (
    <div className="htCustom w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="handsontable-container">
        <HotTable
          ref={hotRef}
          data={data}
          columns={columns}
          colHeaders={true}
          rowHeaders={false}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
          afterChange={handleAfterChange}
          contextMenu={true}
          stretchH="all"
          className="htCustom"
          minSpareRows={1}
          wordWrap={true}
          autoRowSize={true}
          manualRowResize={true}
          manualColumnResize={true}
          allowInvalid={false}
          autoColumnSize={true}
          comments={true}
          cell={[
            {
              row: 0,
              col: 0,
              className: 'htMiddle'
            }
          ]}
          dropdownMenu={[
            'remove_row',
            '---------',
            'alignment',
            '---------',
            'clear_column'
          ]}
        />
      </div>
    </div>
  );
};

export default ModelPropertyList;