/* Which site to build: a folder in sites/. publicworks.nyc is the default,
   and SITE=<folder> picks another. */
export const site = process.env.SITE || 'publicworks';
