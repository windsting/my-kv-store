# Environment Variables

During the deploy process, you can customize the behavior of the *my-kv-store service* by setting the **Environment Variables** on the *project configuring page* of [Vercel](https://vercel.com/).

**Environment Variables** are categrozied into groups.

## Database defination

variable|type|default value
:-|-:|-:
[DB_URI](#db_uri)|string|N/A
[TABLE_PREFIX](#table_prefix)|string|`tbt`
[KVTABLE_NAME](#kvtable_name)|string|`kv`
[COLUMN_PREFIX](#column_prefix)|string|value of *TABLE_PREFIX*
[KEY_COLUMN_LENGTH](#key_column_length)|int|`256`
[VALUE_COLUMN_LENGTH](#value_column_length)|int|`1024 * 8`
[UPDATE_COLUMN_LENGTH](#update_column_length)|int|`256`

> :bulb: Variables in this section define the schema of your table, they need to be set **BEFORE** the first deployment.
>
> If you need to change them after the first deployment, you need to **DROP** the table in your database before a new deployment.

### DB_URI

> :warning: Without a valid connection string, the service won't work.

This is the *Connection String* of your database, you can use the information parts to generate it in the [Document Homepage](https://windsting.github.io/my-kv-store) of this project.

### TABLE_PREFIX

The name of the table to store data comprised with two parts, *prefix* and *name itself*, this prefix is going to be the default value of `COLUMN_PREFIX`.

### KVTABLE_NAME

The *name itself* part of table name.

### COLUMN_PREFIX

The name of columns also comprised with two parts, just like table name.

### KEY_COLUMN_LENGTH

The length limit of each *key*.

### VALUE_COLUMN_LENGTH

The length limit of each *value*.

### UPDATE_COLUMN_LENGTH

The length limit of each *update time*.

## User request control

variable|type|default value
:-|-:|-:
[ROW_COUNT_LIMIT](#row_count_limit)|int|`5000`
[KEY_LENGTH_LIMIT](#key_length_limit)|int|`128`
[VALUE_LENGTH_LIMIT](#value_length_limit)|int|`1024 * 8`
[USER_SET_INTERVAL_MIN](#user_set_interval_min)|int|`60`

### ROW_COUNT_LIMIT

Due to the space limitation, we need to make sure not to exceed the quota. To do this, we combine the *row count* with bytes sum of each columns of the table.

> :bulb: The storage quota of [FreeDB](https://freedb.tech) is **50MB**, assume it is `1,000,000 bytes/MB`.
>
> The total estimated data will be about:
>
> `(KEY_COLUMN_LENGTH + VALUE_COLUMN_LENGTH + UPDATE_COLUMN_LENGTH) * ROW_COUNT_LIMIT`
>
> which by default is
>
> `(256 + 1024 * 8 + 256) * 5000 = 43,520,000 bytes`
>
> , including the `id` column of the table, it will be a little higher.

### KEY_LENGTH_LIMIT

The length limit of the *key* from the user request.

### VALUE_LENGTH_LIMIT

The length limit of the *value* from the user request.

### USER_SET_INTERVAL_MIN

Each key need to wait these seconds between two *set* request.

## Data display

variable|type|default value
:-|-:|-:
[LIST_ROUTE_PART](#list_route_part)|string|`None` -- of python
[PAGE_DEFAULT](#page_default)|int|`1`
[PER_PAGE_DEFAULT](#per_page_default)|int|`10`
[KKEY](#kkey)|string|`key`
[UKEY](#ukey)|string|`update`
[VKEY](#vkey)|string|`value`

### `LIST_ROUTE_PART`

The data can be displayed in a page, but disabled by default, to enable it, set this variable to a string, then the data can be explored in the following page (without parentheses):

`https://your-project-name.vercel.app/kv-(value-of-LIST_ROUTE_PART)`

For example, the test API set this variable to `show`, so you can explore stored data in the following link:

<https://my-kv-store.vercel.app/kv-show>

It's recommanded to save your own link as a **Bookmark**.

### `PAGE_DEFAULT`

The page-number gonna be accessed without sprcifying.

### `PER_PAGE_DEFAULT`

The count of records gonna be displayed in a single page.

### `KKEY`

### `VKEY`

### `UKEY`

> :bulb: By default, data transfered between browser and API looks like this:
>
> ```json
> {
>     "key": "content-of-key",
>     "update": "timestamp-of-last-set",
>     "value": "content-of-value"
> }
> ```
>
> The `key`, `value`, `update` in the json object can be altered by setting above 3 environment variables:
>
> For example, if you set `KKEY` to `k` and `VKEY` to `v`, the API response gonna be looks like:
>
> ```json
> {
>     "k": "content-of-key",
>     "update": "timestamp-of-last-set",
>     "v": "content-of-value"
> }
> ```
