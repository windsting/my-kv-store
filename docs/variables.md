# Environment Variables

During the deploy process, you can customize the behavior of the *my-kv-store service* by setting the **Environment Variables** on the *project configuring page* of [Vercel](https://vercel.com/).

**Environment Variables** are categrozied into groups.

## Database defination

- `DB_URI`

  - Default: `Not available`

    If you don't set a valid connection string, the service won't work.

  This is the *Connection String* of your database, you can use the information parts to generate it in the [Document Homepage](https://windsting.github.io/my-kv-store) of this project.

These variables below in this section define the schema of your table, they need to be set **BEFORE** the first deployment.

If you need to change them after the first deployment, you need to **DROP** the table in your database before a new deployment.

- `TABLE_PREFIX`

  - Default: `tbt` -- means **T**o **B**e **T**ackled

  The name of the table to store data comprised with two parts, *prefix* and *name itself*, this prefix is going to be the default value of `COLUMN_PREFIX`.

- `KVTABLE_NAME`

  - Default: `kv`

  The *name itself* part of table name.

- `COLUMN_PREFIX`

  - Default: *value of `TABLE_PREFIX`*

  The name of columns also comprised with two parts, just like table name.

- `KEY_COLUMN_LENGTH`

  - Default: `256`

  Length limit of each *key*.

- `VALUE_COLUMN_LENGTH`

  - Default: `1024 * 8`

  Length limit of each *value*.

- `UPDATE_COLUMN_LENGTH`

  - Default: `256`

  Length limit of each *update time*.

## User request control

- `ROW_COUNT_LIMIT`

  - Default: `5000`

  Due to the space limitation, we need to make sure not to exceed the quota. To do this, we combine the *row count* with bytes sum of each columns of the table.

  > The storage quota of [FreeDB](https://freedb.tech) is **50MB**, assume it is `1,000,000 bytes/MB`.
  >
  > The total estimated data will be about:
  >
  > `(KEY_COLUMN_LENGTH + VALUE_COLUMN_LENGTH + UPDATE_COLUMN_LENGTH) * ROW_COUNT_LIMIT`
  >
  > which by default is
  >
  > `(256 + 1024 * 8 + 256) * 5000 = 43,520,000 bytes`
  >
  > , including the `id` column of the table, it will be a little higher, basically we have the *safety factor* of
  >
  > `50 / 43.52 = 1.14`

- `KEY_LENGTH_LIMIT`

  - Default: `128`

  The *key* from the user request.

- `VALUE_LENGTH_LIMIT`

  - Default: `1024 * 8`

  The *value* from the user request.

- `USER_SET_INTERVAL_MIN`

  - Default: `60`

    Each key need to wait these seconds between two *set* request.

## Data display

- `LIST_ROUTE_PART`

  - Default: `None` -- of `python`

  The data can be displayed in a page, but disabled by default, to enable it, set this variable to a string, then the data can be explored in the following page (without parentheses):

  `https://your-project-name.vercel.app/kv-(value-of-LIST_ROUTE_PART)`

  For example, the test API set this variable to ``, so you can explore stored data in the following link:

  <https://my-kv-store.vercel.app/kv-show>

- `PAGE_DEFAULT`

  - Default: `1`

  The page-number gonna be accessed without sprcifying.

- `PER_PAGE_DEFAULT`

  - Default: `10`

  The count of records gonna be displayed in a single page.

  > To change `per_page`, modify it manually in the address bar of browser like this:
  >
  > <https://my-kv-store.vercel.app/kv-show?page=1&per_page=3>
  >
  > with this link, there will be `3` rows in each page.

By default, data transfered between browser and API looks like this:

```json
{
    "key": "content-of-key",
    "update": "timestamp-of-last-set",
    "value": "content-of-value"
}
```

The `key`, `value`, `update` in the json object can be changed by set next 3 environment variables:

- `KKEY`

  - Default: `key`

- `VKEY`

  - Default: `value`

- `UKEY`

  - Default: `update`

For example, if you set `KKEY` to `k` and `VKEY` to `v`, the API response gonna be looks like:

```json
{
    "k": "content-of-key",
    "update": "timestamp-of-last-set",
    "v": "content-of-value"
}
```
