-- REMOVE VIEWS
-- Source: https://stackoverflow.com/a/27425133
DECLARE @DELETE_VIEWS_SQL VARCHAR(MAX) = ''
DECLARE @crlf VARCHAR(2) = CHAR(13) + CHAR(10);

;WITH allviews as
( --just combining schema and name
SELECT
    object_id,
    '[' + SCHEMA_NAME(schema_id) + '].[' + name + ']' AS viewname
FROM sys.views
),
dependents AS
( 
SELECT
    referencing.viewname dependentname,
    referenced.viewname dependenton
FROM sys.sql_expression_dependencies r
    INNER JOIN allviews referencing
        ON referencing.object_id = r.referencing_id
    INNER JOIN allviews referenced
        ON referenced.object_id = r.referenced_id
)
,
nodependents 
AS
( 
SELECT
    viewname name
FROM allviews v
    LEFT JOIN dependents d
        ON d.dependentname = viewname
WHERE d.dependentname IS NULL
)
,hierarchy AS
( --the hierarchy recurses the dependencies
SELECT
    d.dependenton,
    d.dependentname,
    1 tier
FROM dependents d UNION ALL SELECT
    d.dependenton,
    d.dependentname,
    h.tier + 1
FROM dependents d
    INNER JOIN hierarchy h
        ON h.dependenton = d.dependentname
--best thing I could think to stop the recursion was to 
--stop when we reached an item with no dependents       
WHERE h.dependenton NOT IN (SELECT
    name
FROM nodependents)
    ),
combined as
( --need to add item with no dependents back in
SELECT
    0 tier,
    name
FROM nodependents UNION SELECT
    tier,
    dependentname
FROM hierarchy  
)
SELECT
    @DELETE_VIEWS_SQL = @DELETE_VIEWS_SQL + 'DROP VIEW ' + name + ';' + @crlf
FROM combined
GROUP BY [name] --need to group because of multiple dependency paths
ORDER BY MAX(tier) desc

PRINT @DELETE_VIEWS_SQL;
EXEC(@DELETE_VIEWS_SQL)

-- REMOVE TABLES
DECLARE @Sql NVARCHAR(500) DECLARE @Cursor CURSOR

SET @Cursor = CURSOR FAST_FORWARD FOR
SELECT DISTINCT sql = 'ALTER TABLE [' + tc2.TABLE_SCHEMA + '].[' +  tc2.TABLE_NAME + '] DROP [' + rc1.CONSTRAINT_NAME + '];'
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc1
LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc2 ON tc2.CONSTRAINT_NAME = rc1.CONSTRAINT_NAME

OPEN @Cursor FETCH NEXT FROM @Cursor INTO @Sql

WHILE (@@FETCH_STATUS = 0)
BEGIN
Exec sp_executesql @Sql
FETCH NEXT FROM @Cursor INTO @Sql
END

CLOSE @Cursor DEALLOCATE @Cursor

EXEC sp_MSforeachtable 'DROP TABLE ?'