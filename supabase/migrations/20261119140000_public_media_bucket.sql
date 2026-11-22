-- Public app content uses getPublicUrl() for images stored in this bucket.
-- A private bucket still returns a URL, but clients cannot fetch the file.
update storage.buckets
set public = true
where id = 'media';
