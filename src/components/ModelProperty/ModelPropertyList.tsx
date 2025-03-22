import { FC, useEffect, useRef, useState } from "react";
import { HotColumn, HotTable } from "@handsontable/react-wrapper";
import { registerAllModules } from 'handsontable/registry';
import type { CellChange, ChangeSource } from 'handsontable/common';
import { PropertyType } from "../../types/modelProperties";
import 'handsontable/styles/handsontable.css';
import '../../styles/ht-theme-seed.css';
import debug from "debug";
import CheckboxRenderer from "./CheckboxRenderer";
import ModelPropertyTypeBadge from "./ModelPropertyTypeBadge";
import { useModels } from "@seedprotocol/sdk";

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
  const [data, setData] = useState<PropertyData[]>([]);
  const [ModelClass, setModelClass] = useState<ModelSchema | null>(null);
  
  const {models} = useModels()

  useEffect(() => {
    if (!models) {
      return
    }
    const ModelClass = models[modelName as keyof typeof models] as unknown as ModelSchema;
    setModelClass(ModelClass);
  }, [models, modelName]);

  useEffect(() => {
    if (!ModelClass) {
      return
    }
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
  }, [ModelClass]);

  const handleAfterChange = (changes: CellChange[] | null, source: ChangeSource) => {
    if (!changes) {
      return;
    }
    logger('Data changed:', changes, 'Source:', source);
    // Here you would implement the logic to update the model schema
    // This is where you'd sync changes back to your model
  };

  return (
    <HotTable
      ref={hotRef}
      data={data}
      colHeaders={true}
      rowHeaders={false}
      height="auto"
      licenseKey="non-commercial-and-evaluation"
      afterChange={handleAfterChange}
      contextMenu={false}
      stretchH="all"
      themeName="ht-theme-seed"
      minSpareRows={1}
      wordWrap={true}
      autoRowSize={false}
      autoColumnSize={false}
      manualRowResize={false}
      manualColumnResize={false}
      manualColumnFreeze={false}
      manualColumnMove={false}
      manualRowMove={false}
      navigableHeaders={false}
      allowInsertColumn={false}
      allowInsertRow={false}
      allowInvalid={false}
      allowRemoveColumn={false}
      allowRemoveRow={false}
      autoWrapRow={false}
      autoWrapCol={false}
    >
      <HotColumn
        data="name"
        title="Property Name"
      />
      <HotColumn
        data="dataType"
        title="Type"
        type="dropdown"
        source={PROPERTY_TYPES}
        renderer={ModelPropertyTypeBadge}
      />
      <HotColumn
        data="storageType"
        title="Storage Type"
      />
      <HotColumn
        data="path"
        title="Path"
      />
      <HotColumn
        data="required"
        title="Required"
        type="checkbox"
        renderer={CheckboxRenderer}
      />
      
    </HotTable>
  );
};

export default ModelPropertyList;