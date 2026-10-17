/** Only intentional protocol codes may leave a sync handler; database errors can contain private SQL values. */
const PUBLIC_SYNC_ERRORS = new Set([
  "version_conflict", "forbidden", "operation_id_reused", "account_contact_required", "authentication_required",
  "public_content_consent_required", "account_changed_reopen_form", "farm_not_found", "animal_not_available",
  "animal_has_linked_records", "area_cannot_reference_area", "area_not_available", "unsupported_operation",
  "immutable_record", "invalid_image", "image_too_large", "invalid_image_dimensions", "storage_unavailable",
  "image_storage_unavailable", "published_owned_farm_required", "published_listing_required", "published_post_required", "published_farm_required",
]);
export function publicSyncError(error: unknown): string {
  return error instanceof Error && PUBLIC_SYNC_ERRORS.has(error.message) ? error.message : "sync_failed";
}
