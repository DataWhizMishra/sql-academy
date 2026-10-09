-- ============================================================================
-- SQL Scrabble Academy - Database Initialization
-- Run as: psql -U postgres -d sql_academy -f db/init.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Core dataset: a single-column English dictionary.
-- Every beginner/intermediate challenge queries this one table.
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS dictionary CASCADE;
CREATE TABLE dictionary (
    id   SERIAL PRIMARY KEY,
    word VARCHAR(45) NOT NULL
);

-- Challenge 12 asks students to design these indexes themselves; we ship the
-- table unindexed beyond the PK so EXPLAIN ANALYZE has something to find.
-- (Students add: CREATE INDEX idx_dictionary_word ON dictionary (word);)

-- ---------------------------------------------------------------------------
-- Scrabble reference data for the advanced tier.
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS scrabble_tiles CASCADE;
CREATE TABLE scrabble_tiles (
    letter    CHAR(1) PRIMARY KEY,
    points    INT NOT NULL,
    bag_count INT NOT NULL  -- how many tiles of this letter exist in a standard 100-tile bag
);

-- Standard English-language Scrabble tile distribution & point values.
INSERT INTO scrabble_tiles (letter, points, bag_count) VALUES
    ('a', 1, 9), ('b', 3, 2), ('c', 3, 2), ('d', 2, 4), ('e', 1, 12),
    ('f', 4, 2), ('g', 2, 3), ('h', 4, 2), ('i', 1, 9), ('j', 8, 1),
    ('k', 5, 1), ('l', 1, 4), ('m', 3, 2), ('n', 1, 6), ('o', 1, 8),
    ('p', 3, 2), ('q', 10, 1), ('r', 1, 6), ('s', 1, 4), ('t', 1, 6),
    ('u', 1, 4), ('v', 4, 2), ('w', 4, 2), ('x', 8, 1), ('y', 4, 2),
    ('z', 10, 1);

-- ---------------------------------------------------------------------------
-- Read-only role used by the API's query-execution endpoint.
-- The app NEVER connects as the owner/migration role at request time.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sql_academy_readonly') THEN
        CREATE ROLE sql_academy_readonly LOGIN PASSWORD 'change_me_in_env';
    END IF;
END
$$;

DO $$
BEGIN
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO sql_academy_readonly', current_database());
END
$$;

GRANT USAGE ON SCHEMA public TO sql_academy_readonly;
GRANT SELECT ON dictionary, scrabble_tiles TO sql_academy_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sql_academy_readonly;

-- Belt-and-suspenders: this role can never write, even to tables created later.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM sql_academy_readonly;
