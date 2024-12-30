import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
  import { relations } from 'drizzle-orm'
  
export const identities = sqliteTable('identities', {
  id: integer('id').unique().primaryKey(),
  versionLocalId: text('version_local_id').unique(),
  versionUid: text('version_uid'),
  seedLocalId: text('seed_local_id'),
  seedUid: text('seed_uid'),
  createdAt: integer('created_at'),
  attestationCreatedAt: integer('attestation_created_at'),
  });

  export const identityData = sqliteTable('identities_data', {
  id: integer('id').unique().primaryKey(),
  propertyLocalId: text('property_local_id').unique(),
  uid: text('uid').unique(),
  propertyName: text('property_name'),
  propertyValue: text('property_value'),
  dataType: text('data_type'),
  easDataType: text('eas_data_type'),
  refValueType: text('ref_value_type'),
  refModelUid: text('ref_model_uid'),
  refVersionUid: text('ref_version_uid'),
  refSeedType: text('ref_seed_type'),
  refSeedUid: text('ref_seed_uid'),
  refSeedUids: text('ref_seed_uids'),
  refResolvedValue: text('ref_resolved_value'),
  refResolvedDisplayValue: text('ref_resolved_display_value'),
  versionLocalId: text('version_local_id'),
  versionUid: text('version_uid'),
  seedLocalId: text('seed_local_id'),
  seedUid: text('seed_uid'),
  schemaUid: text('schema_uid'),
  createdAt: integer('created_at'),
  attestationRaw: text('attestation_raw'),
  attestationCreatedAt: integer('attestation_created_at'),
  identityId: integer('identities_id').references(() => identities.id),
  });

  export const identitiesDataRelations = relations(identityData, ({ one }) => ({
  identities: one(identities),
  }));

export type identitiesType = identities.$inferSelect
