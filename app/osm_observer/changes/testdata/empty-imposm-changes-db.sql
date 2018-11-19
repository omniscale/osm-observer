--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.6
-- Dumped by pg_dump version 10.4

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

DROP SCHEMA IF EXISTS osm_changes_test CASCADE;


CREATE SCHEMA osm_changes_test;

-- SET search_path osm_changes_test,public;


CREATE TABLE osm_changes_test.changesets (
    id integer NOT NULL,
    created_at timestamp with time zone,
    closed_at timestamp with time zone,
    num_changes integer,
    open boolean,
    user_name character varying,
    user_id integer,
    tags public.hstore,
    bbox public.geometry(Polygon,4326)
);


CREATE TABLE osm_changes_test.comments (
    changeset_id bigint NOT NULL,
    idx integer NOT NULL,
    user_name character varying,
    user_id integer,
    "timestamp" timestamp with time zone,
    text character varying
);


CREATE TABLE osm_changes_test.current_status (
    type character varying,
    sequence integer,
    "timestamp" timestamp with time zone
);


CREATE TABLE osm_changes_test.members (
    relation_id integer NOT NULL,
    relation_version integer NOT NULL,
    idx integer NOT NULL,
    type character varying,
    role character varying,
    member_node_id bigint,
    member_way_id integer,
    member_relation_id integer
);


CREATE TABLE osm_changes_test.nds (
    way_id integer NOT NULL,
    way_version integer NOT NULL,
    idx integer NOT NULL,
    node_id bigint NOT NULL
);


CREATE TABLE osm_changes_test.nodes (
    id bigint NOT NULL,
    add boolean,
    modify boolean,
    delete boolean,
    changeset integer,
    geometry public.geometry(Point,4326),
    user_name character varying,
    user_id integer,
    "timestamp" timestamp with time zone,
    version integer NOT NULL,
    tags public.hstore
);

CREATE TABLE osm_changes_test.relations (
    id integer NOT NULL,
    add boolean,
    modify boolean,
    delete boolean,
    changeset integer,
    user_name character varying,
    user_id integer,
    "timestamp" timestamp with time zone,
    version integer NOT NULL,
    tags public.hstore
);


CREATE TABLE osm_changes_test.ways (
    id integer NOT NULL,
    add boolean,
    modify boolean,
    delete boolean,
    changeset integer,
    user_name character varying,
    user_id integer,
    "timestamp" timestamp with time zone,
    version integer NOT NULL,
    tags public.hstore
);


ALTER TABLE ONLY osm_changes_test.changesets
    ADD CONSTRAINT changesets_pkey PRIMARY KEY (id);


ALTER TABLE ONLY osm_changes_test.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (changeset_id, idx);


ALTER TABLE ONLY osm_changes_test.current_status
    ADD CONSTRAINT current_status_type_key UNIQUE (type);


ALTER TABLE ONLY osm_changes_test.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (relation_id, relation_version, idx);


ALTER TABLE ONLY osm_changes_test.nds
    ADD CONSTRAINT nds_pkey PRIMARY KEY (way_id, way_version, idx, node_id);

ALTER TABLE ONLY osm_changes_test.nodes
    ADD CONSTRAINT nodes_pkey PRIMARY KEY (id, version);


ALTER TABLE ONLY osm_changes_test.relations
    ADD CONSTRAINT relations_pkey PRIMARY KEY (id, version);

ALTER TABLE ONLY osm_changes_test.ways
    ADD CONSTRAINT ways_pkey PRIMARY KEY (id, version);

CREATE INDEX changesets_bbox_idx ON osm_changes_test.changesets USING gist (bbox);

CREATE INDEX nds_node_idx ON osm_changes_test.nds USING btree (node_id);

CREATE INDEX nodes_changeset_idx ON osm_changes_test.nodes USING btree (changeset);

CREATE INDEX nodes_changset_idx ON osm_changes_test.nodes USING btree (changeset);

CREATE INDEX nodes_geometry_idx ON osm_changes_test.nodes USING gist (geometry);

CREATE INDEX nodes_id_idx ON osm_changes_test.nodes USING hash (id);

CREATE INDEX relations_changset_idx ON osm_changes_test.relations USING btree (changeset);

CREATE INDEX ways_changset_idx ON osm_changes_test.ways USING btree (changeset);

ALTER TABLE ONLY osm_changes_test.comments
    ADD CONSTRAINT comments_changeset_id_fkey FOREIGN KEY (changeset_id) REFERENCES changesets(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY osm_changes_test.members
    ADD CONSTRAINT members_relation_id_fkey FOREIGN KEY (relation_id, relation_version) REFERENCES relations(id, version) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY osm_changes_test.nds
    ADD CONSTRAINT nds_way_id_fkey FOREIGN KEY (way_id, way_version) REFERENCES ways(id, version) ON UPDATE CASCADE ON DELETE CASCADE;

