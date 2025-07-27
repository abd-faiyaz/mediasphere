--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Ubuntu 17.5-0ubuntu0.25.04.1)
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-0ubuntu0.25.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id uuid NOT NULL,
    activity_type character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description character varying(255) NOT NULL,
    reference_id uuid,
    reference_type character varying(255),
    club_id uuid,
    user_id uuid
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: club_leave_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.club_leave_logs (
    id uuid NOT NULL,
    left_at timestamp(6) without time zone NOT NULL,
    reason text,
    club_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.club_leave_logs OWNER TO postgres;

--
-- Name: clubs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clubs (
    id uuid NOT NULL,
    media_type_id uuid,
    name character varying(255) NOT NULL,
    description character varying(255),
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_activity_at timestamp without time zone,
    last_thread_created_at timestamp without time zone,
    value integer,
    clubvalue character varying(255)
);


ALTER TABLE public.clubs OWNER TO postgres;

--
-- Name: comment_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment_likes (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.comment_likes OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    thread_id uuid,
    created_by uuid,
    content text NOT NULL,
    parent_comment_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    like_count integer NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: event_interests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_interests (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.event_interests OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid NOT NULL,
    club_id uuid,
    created_by uuid,
    title character varying(255) NOT NULL,
    description character varying(255),
    event_date timestamp without time zone NOT NULL,
    location character varying(255),
    max_participants integer,
    current_participants integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id uuid NOT NULL,
    media_type_id uuid,
    title character varying(255) NOT NULL,
    description character varying(255),
    author character varying(255),
    release_year integer,
    genre character varying(255),
    image_url character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_types (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255)
);


ALTER TABLE public.media_types OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid,
    title character varying(255) NOT NULL,
    content text,
    type character varying(255) NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    reference_id uuid,
    reference_type character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    actor_id uuid
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: thread_dislikes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thread_dislikes (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.thread_dislikes OWNER TO postgres;

--
-- Name: thread_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thread_images (
    id uuid NOT NULL,
    content_type character varying(100),
    file_size bigint,
    image_name character varying(255),
    image_url character varying(500) NOT NULL,
    uploaded_at timestamp(6) without time zone NOT NULL,
    thread_id uuid NOT NULL
);


ALTER TABLE public.thread_images OWNER TO postgres;

--
-- Name: thread_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thread_likes (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.thread_likes OWNER TO postgres;

--
-- Name: threads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.threads (
    id uuid NOT NULL,
    club_id uuid,
    created_by uuid,
    title character varying(255) NOT NULL,
    content text,
    view_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    like_count integer DEFAULT 0 NOT NULL,
    dislike_count integer DEFAULT 0 NOT NULL,
    last_activity_at timestamp(6) without time zone
);


ALTER TABLE public.threads OWNER TO postgres;

--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_achievements (
    id uuid NOT NULL,
    achievement_type character varying(255) NOT NULL,
    description character varying(255),
    earned_at timestamp(6) without time zone NOT NULL,
    icon character varying(255),
    title character varying(255) NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.user_achievements OWNER TO postgres;

--
-- Name: user_clubs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_clubs (
    user_id uuid NOT NULL,
    club_id uuid NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_clubs OWNER TO postgres;

--
-- Name: user_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_statistics (
    user_id uuid NOT NULL,
    clubs_joined integer NOT NULL,
    comments_posted integer NOT NULL,
    events_attended integer NOT NULL,
    likes_received integer NOT NULL,
    threads_created integer NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_statistics OWNER TO postgres;

--
-- Name: user_thread_reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_thread_reactions (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    reaction_type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT user_thread_reactions_reaction_type_check CHECK (((reaction_type)::text = ANY ((ARRAY['LIKE'::character varying, 'DISLIKE'::character varying])::text[])))
);


ALTER TABLE public.user_thread_reactions OWNER TO postgres;

--
-- Name: user_thread_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_thread_views (
    id uuid NOT NULL,
    viewed_at timestamp(6) without time zone NOT NULL,
    thread_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.user_thread_views OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    username character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    profile_pic character varying(255),
    clerk_user_id character varying(255),
    oauth_provider character varying(255),
    oauth_provider_id character varying(255),
    is_email_verified boolean DEFAULT false NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    oauth_profile_picture character varying(255),
    last_oauth_sync timestamp without time zone,
    primary_auth_method character varying(255),
    last_login_at timestamp without time zone,
    last_login_method character varying(255),
    account_created_via character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, activity_type, created_at, description, reference_id, reference_type, club_id, user_id) FROM stdin;
c8d13fb9-0078-4e09-b9e3-75362d7ae843	member_left	2025-07-03 16:28:52.539506	Suman Ahmed Sinan left the club (Reason: emni kichui na)	\N	membership	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
cf559147-f350-49d9-ad1f-53d1150a20fe	member_left	2025-07-03 21:46:04.285556	Suman Ahmed Sinan left the club (Reason: emni e re)	\N	membership	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
09696285-06f0-42f0-abaf-0c63d212627a	member_left	2025-07-03 22:58:50.739593	Suman Ahmed Sinan left the club	\N	membership	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
57666244-81a2-4afc-9d3d-264b5d82d034	member_left	2025-07-04 13:40:36.879432	Suman Ahmed Sinan left the club	\N	membership	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d
d7a6565b-c648-4cbc-8995-0327aa9a70dc	member_left	2025-07-04 14:21:28.405963	Suman Ahmed Sinan left the club (Reason: rrrrrrrrrrrrrrrr)	\N	membership	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d
d8997257-af00-41eb-94c9-858c38777758	member_left	2025-07-04 14:56:56.31804	Suman Ahmed Sinan left the club	\N	membership	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
c07f9121-9e97-4b7e-b560-9899347c7ca5	member_left	2025-07-04 15:37:33.273669	Suman Ahmed Sinan left the club	\N	membership	452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d
caa46b4e-964c-4aae-b1c7-95528dd4de3d	member_left	2025-07-05 09:30:42.862137	Suman Ahmed Sinan left the club	\N	membership	df50b126-de42-412e-9ee0-4d5f2b2412ee	a688cb56-0dca-466b-840f-e277a3d1431d
c07f9d59-32ab-4ce3-aa10-080a1788c2ca	member_left	2025-07-05 21:55:35.155344	Shemul Samiul left the club	\N	membership	68787b29-734e-4b10-a4bf-401f1ae3e3b6	11cfd680-2c4c-43fd-aed0-7ba80604f411
177d03de-c068-444b-ae6e-a896c81ead49	member_left	2025-07-05 23:05:01.189247	Shemul Samiul left the club	\N	membership	68787b29-734e-4b10-a4bf-401f1ae3e3b6	11cfd680-2c4c-43fd-aed0-7ba80604f411
\.


--
-- Data for Name: club_leave_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.club_leave_logs (id, left_at, reason, club_id, user_id) FROM stdin;
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clubs (id, media_type_id, name, description, created_by, created_at, last_activity_at, last_thread_created_at, value, clubvalue) FROM stdin;
57e7af79-b324-4e3c-91af-5f5f92317e0e	550e8400-e29b-41d4-a716-446655440001	Sci-Fi Movie Club	Discussion club for science fiction movies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 13:40:27.681744	\N	\N
df50b126-de42-412e-9ee0-4d5f2b2412ee	550e8400-e29b-41d4-a716-446655440004	Studio Ghibli Appreciation Society	Dedicated to discussing and analyzing Studio Ghibli films	3281e9dd-b913-4d48-836f-0b5539d89999	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 14:57:51.432997	\N	\N
8612a07b-91fc-4177-b326-765af2aa76ad	1e1756e6-549e-4db9-a974-e05e9c9181fb	Sumon	baal create	a688cb56-0dca-466b-840f-e277a3d1431d	2025-07-02 09:54:50.097023	2025-07-04 16:08:34.43969	2025-07-04 16:08:34.43969	\N	\N
1153d21a-30da-4240-878c-9bbf2bc268e0	550e8400-e29b-41d4-a716-446655440003	Sci-Fi Book Club	Discussion club for science fiction books	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-07-07 10:03:51.973489	2025-07-07 10:03:51.973489	\N	\N
0c167685-5bed-45be-aa67-3d682f5f62b6	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	a b c	def	a688cb56-0dca-466b-840f-e277a3d1431d	2025-06-30 09:08:48.269639	2025-07-12 19:27:31.2851	2025-07-12 19:27:31.2851	\N	\N
aa88ed56-9e54-4aa3-b33b-b16e1da02e8c	550e8400-e29b-41d4-a716-446655440003	asfiaj asjd	askdjsdj oowe	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 15:41:11.665434	\N	\N	0	\N
ddc02c3d-d7c6-43c9-81b2-a2d603c5bc4c	550e8400-e29b-41d4-a716-446655440003	ajhxjhas	dvjkakjc	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 16:24:54.283328	\N	\N	132871	\N
e7182d74-efb3-4427-bf94-4dc6a769c5e5	550e8400-e29b-41d4-a716-446655440003	asfjash iasohdoiase	asjeoiwr oieurinvnvm	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 16:20:26.866912	2025-07-26 21:50:32.419836	2025-07-26 21:50:32.419836	22	\N
8825011e-38ce-48da-b6e5-2fad2b44df69	550e8400-e29b-41d4-a716-446655440004	sample_value_club	adjfajfha afuihfkja	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 16:17:48.102352	2025-07-27 13:36:58.406687	2025-07-27 13:36:58.406687	2	\N
68787b29-734e-4b10-a4bf-401f1ae3e3b6	550e8400-e29b-41d4-a716-446655440001	Sci-Fi Movie Club	Discussion club for science fiction movies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 13:42:38.040383	\N	\N
5e5fe910-bd7c-464d-957f-fbcfadd72854	550e8400-e29b-41d4-a716-446655440002	Sci-Fi TV Series Club	Discussion club for science fiction tv seriess	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	\N	\N	\N
452c7a0d-2eae-421d-9696-92e7f131254b	550e8400-e29b-41d4-a716-446655440003	Sci-Fi Book Club	Discussion club for science fiction books	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-07-04 15:36:07.213565	2025-07-04 15:36:07.213565	\N	\N
\.


--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comment_likes (id, created_at, comment_id, user_id) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, thread_id, created_by, content, parent_comment_id, created_at, updated_at, like_count) FROM stdin;
7115f2a1-634d-4c10-8242-55fb06253ef7	7cec4af6-88bf-435c-8813-732432adb428	a688cb56-0dca-466b-840f-e277a3d1431d	kn	\N	2025-07-04 18:47:51.211484	\N	0
858f5e69-7d9f-4758-a692-ffdda66264d9	c660eca2-a023-446f-a193-d829dc735275	11cfd680-2c4c-43fd-aed0-7ba80604f411	na mane ar ki	\N	2025-07-04 18:50:17.970923	\N	0
5e30a6fd-27ad-48c7-a4bb-50684414f84d	7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd	a688cb56-0dca-466b-840f-e277a3d1431d	hey\n	\N	2025-07-04 20:32:38.411962	\N	0
dc595441-50f4-49f2-81d2-52f272a11a50	7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd	a688cb56-0dca-466b-840f-e277a3d1431d	ki	5e30a6fd-27ad-48c7-a4bb-50684414f84d	2025-07-04 20:32:47.969645	\N	0
9cb28705-8ace-4d3c-a7c6-d6f19220f11c	7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd	a688cb56-0dca-466b-840f-e277a3d1431d	na	\N	2025-07-04 20:32:54.444836	\N	0
46b78714-9af3-4c6a-ad07-7b35a4cd824d	c660eca2-a023-446f-a193-d829dc735275	a688cb56-0dca-466b-840f-e277a3d1431d	jhhj	\N	2025-07-04 20:33:39.630993	\N	0
1e97819d-19f0-4dfb-a2c0-bf98cef68292	c660eca2-a023-446f-a193-d829dc735275	a688cb56-0dca-466b-840f-e277a3d1431d	dd	\N	2025-07-04 20:33:42.53581	\N	0
f50ac3af-4c8e-4aa2-a591-bf1006cc71a2	c660eca2-a023-446f-a193-d829dc735275	a688cb56-0dca-466b-840f-e277a3d1431d	fh	46b78714-9af3-4c6a-ad07-7b35a4cd824d	2025-07-04 20:33:49.901482	\N	0
edbc2ad6-8d68-41ad-9d0a-280e75192b9f	fd43fa7a-a60b-4349-bc41-533580643fc0	a688cb56-0dca-466b-840f-e277a3d1431d	hey\n	\N	2025-07-04 20:49:38.128242	\N	0
e03fa9a4-1275-461d-9333-976a0ddbccb0	fd43fa7a-a60b-4349-bc41-533580643fc0	a688cb56-0dca-466b-840f-e277a3d1431d	ggd	edbc2ad6-8d68-41ad-9d0a-280e75192b9f	2025-07-04 20:49:46.443651	\N	0
18001203-d703-4504-aea9-32b8a4979d1b	2bab3d09-8e22-492a-81f0-63c0630bef53	a688cb56-0dca-466b-840f-e277a3d1431d	gty	\N	2025-07-04 22:20:11.799491	\N	0
2d472beb-64db-4954-acab-458370411044	e854452d-a967-4d01-ae54-aadbc09e12fc	a688cb56-0dca-466b-840f-e277a3d1431d	gghjkhghjkl	\N	2025-07-05 09:45:50.538209	\N	0
0833f2ae-2f69-43b3-8bff-c304baf3b18e	e854452d-a967-4d01-ae54-aadbc09e12fc	a688cb56-0dca-466b-840f-e277a3d1431d	hy	2d472beb-64db-4954-acab-458370411044	2025-07-05 09:45:57.147284	\N	0
cacb9f40-64a4-4636-a9cb-7590a95fde0b	c660eca2-a023-446f-a193-d829dc735275	a688cb56-0dca-466b-840f-e277a3d1431d	ghj	\N	2025-07-05 14:18:21.813499	\N	0
d5b1426f-e842-4078-928c-3c1811f41832	c660eca2-a023-446f-a193-d829dc735275	a688cb56-0dca-466b-840f-e277a3d1431d	hdgghghg	cacb9f40-64a4-4636-a9cb-7590a95fde0b	2025-07-05 14:18:33.724283	\N	0
ee6fc652-3588-45b4-8f39-bdb2322809a0	fd43fa7a-a60b-4349-bc41-533580643fc0	11cfd680-2c4c-43fd-aed0-7ba80604f411	naao thamao	\N	2025-07-05 19:52:03.644202	\N	0
a37c6f66-22be-4cc0-805b-74009d9f5198	fd43fa7a-a60b-4349-bc41-533580643fc0	11cfd680-2c4c-43fd-aed0-7ba80604f411	fgfhd	edbc2ad6-8d68-41ad-9d0a-280e75192b9f	2025-07-05 20:23:50.134969	\N	0
9dfa23ed-469b-4e32-a544-455baf33ca73	fd43fa7a-a60b-4349-bc41-533580643fc0	11cfd680-2c4c-43fd-aed0-7ba80604f411	hello	\N	2025-07-05 20:54:41.345344	\N	0
b2fc9bee-908d-40af-9f64-08b06ef41a47	7cec4af6-88bf-435c-8813-732432adb428	11cfd680-2c4c-43fd-aed0-7ba80604f411	daami unger	\N	2025-07-05 21:32:45.250962	\N	0
d0dc1bce-a1aa-42aa-bff3-e6f38a7bbe9e	9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	11cfd680-2c4c-43fd-aed0-7ba80604f411	hey boy	\N	2025-07-05 21:44:45.322189	\N	0
41d5f298-006c-44d3-9cc8-e2e46c5b987b	9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	11cfd680-2c4c-43fd-aed0-7ba80604f411	hello boy	d0dc1bce-a1aa-42aa-bff3-e6f38a7bbe9e	2025-07-05 21:44:59.281363	\N	0
dcde686b-2a78-43ee-a43a-9d1180f04955	9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	11cfd680-2c4c-43fd-aed0-7ba80604f411	fghf	\N	2025-07-05 21:56:54.997478	\N	0
1a67d9ee-2767-4afd-ac54-732a114d2c3b	9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	11cfd680-2c4c-43fd-aed0-7ba80604f411	dfg	dcde686b-2a78-43ee-a43a-9d1180f04955	2025-07-05 21:57:24.877394	\N	0
f7367506-3029-49b7-8d3b-317e0fa16c4b	fd43fa7a-a60b-4349-bc41-533580643fc0	11cfd680-2c4c-43fd-aed0-7ba80604f411	gghjk\n	\N	2025-07-05 22:28:56.941081	\N	0
240a41ca-806d-4ded-b175-2bb21d251283	fd43fa7a-a60b-4349-bc41-533580643fc0	11cfd680-2c4c-43fd-aed0-7ba80604f411	gggg	f7367506-3029-49b7-8d3b-317e0fa16c4b	2025-07-05 22:29:04.731602	\N	0
fb484870-5996-4ecc-ba0e-cee147f53305	fd43fa7a-a60b-4349-bc41-533580643fc0	a688cb56-0dca-466b-840f-e277a3d1431d	taai naaki	9dfa23ed-469b-4e32-a544-455baf33ca73	2025-07-05 22:36:39.003256	\N	0
1e59e03f-8940-493f-b908-157558e84f28	9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	11cfd680-2c4c-43fd-aed0-7ba80604f411	gg	\N	2025-07-05 23:04:10.70211	\N	0
2ceab3eb-4758-4690-91c6-c935fa1a770c	e226e86d-759c-4dd5-9a6e-093865d9a8c2	11cfd680-2c4c-43fd-aed0-7ba80604f411	good, very good\n	\N	2025-07-07 10:05:39.543971	\N	0
9a097de9-76b5-4b67-93bf-adf8ceb264a0	e226e86d-759c-4dd5-9a6e-093865d9a8c2	4a754586-c9bd-4c47-8599-a9f34e309464	okkay	2ceab3eb-4758-4690-91c6-c935fa1a770c	2025-07-11 20:43:23.42127	\N	0
5107fe6c-7474-4443-a2bf-fb0e9258b172	f7d27d01-9de4-43cf-aca4-608caa7b5327	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	huiertvsiuhdfiush sdfus	\N	2025-07-12 23:43:56.205502	\N	0
b653bd82-5103-43cc-8399-3d20ab247cf4	37839c26-ae93-409e-8dc0-c63910b9eb04	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	nununununu\n	\N	2025-07-26 21:49:20.850826	\N	0
191d7c7f-8b60-435e-89f7-63a59e176bb5	37839c26-ae93-409e-8dc0-c63910b9eb04	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	yeah boiiii\n	b653bd82-5103-43cc-8399-3d20ab247cf4	2025-07-26 21:49:28.621742	\N	0
\.


--
-- Data for Name: event_interests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_interests (id, created_at, event_id, user_id) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, club_id, created_by, title, description, event_date, location, max_participants, current_participants, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, media_type_id, title, description, author, release_year, genre, image_url, created_at, updated_at) FROM stdin;
4f3b51c1-5db7-4d8d-9597-6f9804e13227	550e8400-e29b-41d4-a716-446655440001	The Shawshank Redemption	Two imprisoned men bond over years, finding solace and redemption	Frank Darabont	1994	Drama	https://i.etsystatic.com/39089009/r/il/d10f0f/4402721990/il_fullxfull.4402721990_s8x7.jpg	2025-07-27 16:08:34.037953	\N
305d5a2b-955c-453f-ab2f-851e148cb3e9	550e8400-e29b-41d4-a716-446655440001	The Godfather	The aging patriarch of an organized crime dynasty transfers control	Francis Ford Coppola	1972	Crime/Drama	https://myhotposters.com/cdn/shop/products/HP2380_6791609f-6878-43b1-b42b-864da2e5017e_1024x1024.jpg?v=1748537699	2025-07-27 16:08:34.037953	\N
8a7d2c92-b541-4aa2-be90-edb9b20d4c3b	550e8400-e29b-41d4-a716-446655440001	The Dark Knight	Batman faces the Joker in this intense superhero thriller	Christopher Nolan	2008	Action/Crime	https://www.themoviedb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg	2025-07-27 16:08:34.037953	\N
b39fb100-db78-4348-b063-01330a990ac8	550e8400-e29b-41d4-a716-446655440001	Pulp Fiction	Interconnected stories of crime and redemption in Los Angeles	Quentin Tarantino	1994	Crime/Drama	https://i5.walmartimages.com/seo/Pulp-Fiction-Movie-Poster-Regular-Mia-Wallace-On-Bed-Size-24-X-36_ce193b8f-4979-4dd4-89fb-cb5bda97b87b.47bd5508be83004cfd0b4ae1123a208e.jpeg	2025-07-27 16:08:34.037953	\N
fa80ba20-8153-4360-9972-ebbc9e21b18d	550e8400-e29b-41d4-a716-446655440001	Forrest Gump	The extraordinary life journey of a simple man	Robert Zemeckis	1994	Drama/Romance	https://i5.walmartimages.com/seo/Forrest-Gump-Movie-Poster-Regular-Style-Size-24-X-36_296a1977-d296-4748-9bea-84bb6080fae1.9d60e858067c3c6a61e2a3de606c75bb.jpeg	2025-07-27 16:08:34.037953	\N
3c55deac-aa6d-4605-95f6-1c9676ff6e64	550e8400-e29b-41d4-a716-446655440001	Inception	A thief enters dreams to plant ideas in this mind-bending thriller	Christopher Nolan	2010	Sci-Fi/Thriller	https://i5.walmartimages.com/seo/Inception-Movie-Poster-Print-27-x-40-Item-MOVIB87101_80ec37c1-d6d8-4df6-b281-0ca24f4d2961.1fb7f54255a9ef4757072f3aca4e36ff.jpeg	2025-07-27 16:08:34.037953	\N
b72f2c70-32ba-4727-b091-484cc795d125	550e8400-e29b-41d4-a716-446655440001	The Matrix	A hacker discovers reality is a computer simulation	The Wachowskis	1999	Sci-Fi/Action	https://img.moviepostershop.com/the-matrix-movie-poster-1999-1020189516.jpg	2025-07-27 16:08:34.037953	\N
8def709d-14e7-427b-bbc2-44d9618a1263	550e8400-e29b-41d4-a716-446655440001	Goodfellas	The rise and fall of a mob associate over three decades	Martin Scorsese	1990	Crime/Biography	https://i5.walmartimages.com/seo/GoodFellas-Movie-Poster-GoodFellas-Classic-Vintage-Movie-Poster-Classic-Movie-Art-Poster_8d2dcc84-7a89-420a-8bb9-64b21d24a04f.a3ff7a1b44d2216567fa16cfc6a5e9c8.jpeg	2025-07-27 16:08:34.037953	\N
33f1382c-a68c-41f0-a96f-9446a85b1eb4	550e8400-e29b-41d4-a716-446655440001	Schindlers List	A businessman saves Jews during the Holocaust	Steven Spielberg	1993	Biography/Drama	https://upload.wikimedia.org/wikipedia/en/3/38/Schindler%27s_List_movie.jpg	2025-07-27 16:08:34.037953	\N
510ecbf2-03c2-4cf1-acd4-6815c731b2f9	550e8400-e29b-41d4-a716-446655440001	Interstellar	Astronauts travel through a wormhole to save humanity	Christopher Nolan	2014	Sci-Fi/Drama	https://i5.walmartimages.com/seo/Interstellar-Vintage-Movie-Poster-Matthew-McConaughey-Anne-Hathaway-Minimalist-Midcentury-Wall-Art-Print_ca45c77a-cdc0-4682-8d10-df3c6c200fb3.9a325fee80406af49385047fb34ad272.jpeg	2025-07-27 16:08:34.037953	\N
7cfd3e8d-047b-46e9-9a04-081fe4ff82a2	550e8400-e29b-41d4-a716-446655440002	Breaking Bad	A chemistry teacher turns to manufacturing drugs	Vince Gilligan	2008	Crime/Drama	https://i5.walmartimages.com/seo/Breaking-Bad-Poster-Wall-Art-Canvas-Aesthetic-Music-And-Movies-Decorative-Living-Room-Bed-Room_9ffd0038-42ed-488d-b697-7af5114697af.d581f844194fd4d6ea1fdab51ea8f5e6.jpeg	2025-07-27 16:08:34.046637	\N
9c4288a7-f6b3-4eda-a6a3-ecdf712c9b5e	550e8400-e29b-41d4-a716-446655440002	Game of Thrones	Noble families vie for control of the Iron Throne	David Benioff	2011	Fantasy/Drama	https://media.posterstore.com/site_images/68631ba7603ad773cc39b745_438436851_WB0032-8.jpg	2025-07-27 16:08:34.046637	\N
cacbbb6a-d3d3-40bf-a357-98fcf8c7ccc1	550e8400-e29b-41d4-a716-446655440002	The Sopranos	A New Jersey mob boss balances family and crime	David Chase	1999	Crime/Drama	https://i5.walmartimages.com/seo/The-Sopranos-Poster-by-24-x-36_d0e7bc90-6de5-40d2-a67e-6442bcea0405.0456972a02d07e36bf05e3c00d852384.jpeg	2025-07-27 16:08:34.046637	\N
bceb0ec2-d2b4-4c6b-8450-de224de38ab5	550e8400-e29b-41d4-a716-446655440002	Stranger Things	Kids in a small town encounter supernatural forces	The Duffer Brothers	2016	Sci-Fi/Horror	https://i5.walmartimages.com/seo/Netflix-Stranger-Things-Season-4-Hawkins-Indiana-Wall-Poster-22-375-x-34_81ccb8f2-8b7f-40d0-9183-7edc03c9d1f0.3f7a1cefb524024c944952e10624b95f.jpeg	2025-07-27 16:08:34.046637	\N
0df02a6c-2e9c-400c-b773-02314556d998	550e8400-e29b-41d4-a716-446655440002	The Wire	Crime and law enforcement in Baltimore from multiple perspectives	David Simon	2002	Crime/Drama	https://i.etsystatic.com/6883834/r/il/d00278/63406834/il_570xN.63406834.jpg	2025-07-27 16:08:34.046637	\N
855ad91b-55d7-473d-a1e3-bb76eabc1752	550e8400-e29b-41d4-a716-446655440002	Friends	Six friends navigate life and love in New York City	David Crane	1994	Comedy/Romance	https://i5.walmartimages.com/seo/Friends-Freak-Out-Wall-Poster-22-375-x-34_59bb00c5-c2ea-4481-ab99-45fed307daef.bc996d3339b6c6d728511fbc7ab19424.jpeg	2025-07-27 16:08:34.046637	\N
6d95c39a-66fb-487f-b301-0faf51ebc87e	550e8400-e29b-41d4-a716-446655440002	The Office	Mockumentary about office workers at a paper company	Greg Daniels	2005	Comedy	https://i5.walmartimages.com/seo/Pyramid-America-The-Office-Dunder-Mifflin-Inc-TV-Series-Show-Poster-Print-24x36_a63d3e35-114c-4358-8534-dd847e7a5803.f053a4305e196725e342593325b8489d.jpeg	2025-07-27 16:08:34.046637	\N
f37da241-d862-471f-8ce6-9034e7a67979	550e8400-e29b-41d4-a716-446655440002	Lost	Plane crash survivors on a mysterious island	J.J. Abrams	2004	Mystery/Drama	https://i.ebayimg.com/images/g/p~IAAOSw~7Fj~yq-/s-l1600.jpg	2025-07-27 16:08:34.046637	\N
a05086b6-1b65-4699-b89f-04a0bc105836	550e8400-e29b-41d4-a716-446655440002	The Crown	The reign of Queen Elizabeth II from the 1940s to modern times	Peter Morgan	2016	Biography/Drama	https://i.etsystatic.com/23553693/r/il/dcf8de/3973219493/il_570xN.3973219493_l18j.jpg	2025-07-27 16:08:34.046637	\N
8a54a8ec-b796-40f0-8536-208727daf6b1	550e8400-e29b-41d4-a716-446655440002	Sherlock	Modern adaptation of Arthur Conan Doyle detective stories	Mark Gatiss	2010	Crime/Mystery	https://i.ebayimg.com/images/g/pmkAAOSwzMVnDMzT/s-l1600.jpg	2025-07-27 16:08:34.046637	\N
e3eaf289-714d-4441-b032-243f1f269530	550e8400-e29b-41d4-a716-446655440003	To Kill a Mockingbird	A young girl witnesses racial injustice in the American South	Harper Lee	1960	Fiction/Drama	https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg	2025-07-27 16:08:34.048129	\N
01e3c9a1-1263-4a4d-9ed8-8034662f8a05	550e8400-e29b-41d4-a716-446655440003	1984	A dystopian tale of totalitarian government control	George Orwell	1949	Dystopian Fiction	https://www.thebookdesigner.com/wp-content/uploads/2024/01/1984-2-e1705508013429.jpg	2025-07-27 16:08:34.048129	\N
bcf3b041-f96d-47f8-9630-acf386387e4a	550e8400-e29b-41d4-a716-446655440003	Pride and Prejudice	Romance and social commentary in Regency-era England	Jane Austen	1813	Romance/Classic	https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/PrideAndPrejudiceTitlePage.jpg/250px-PrideAndPrejudiceTitlePage.jpg	2025-07-27 16:08:34.048129	\N
7b54e798-ea6d-44ec-8162-aefb4f6c6dbf	550e8400-e29b-41d4-a716-446655440003	The Great Gatsby	The American Dream and excess in the Jazz Age	F. Scott Fitzgerald	1925	Classic Fiction	https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1738790966i/4671.jpg	2025-07-27 16:08:34.048129	\N
6035f92e-f4fc-49ff-bca1-88e69e8f6f24	550e8400-e29b-41d4-a716-446655440003	The Lord of the Rings	Epic fantasy quest to destroy the One Ring	J.R.R. Tolkien	1954	Fantasy/Adventure	https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33.jpg	2025-07-27 16:08:34.048129	\N
7b4683cd-45f8-4b8f-873b-d8dc6d21dd9e	550e8400-e29b-41d4-a716-446655440003	Harry Potter and the Philosophers Stone	A boy wizard begins his magical education	J.K. Rowling	1997	Fantasy/Young Adult	https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1170803558l/72193.jpg	2025-07-27 16:08:34.048129	\N
c03f7e7d-554d-4f0a-8e2a-e4341ff5b538	550e8400-e29b-41d4-a716-446655440003	The Catcher in the Rye	A teenager struggles with alienation and growing up	J.D. Salinger	1951	Coming-of-age Fiction	https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg	2025-07-27 16:08:34.048129	\N
611ce9df-f501-4768-957b-cc75baf25062	550e8400-e29b-41d4-a716-446655440003	Dune	Political intrigue and ecology on a desert planet	Frank Herbert	1965	Science Fiction	https://bookcoverzone.com/slir/h1000/png24-front/bookcover0032294.jpg	2025-07-27 16:08:34.048129	\N
016ce177-ce3f-4735-a753-4bfdd213fa3c	550e8400-e29b-41d4-a716-446655440003	The Hobbit	A hobbit embarks on an unexpected adventure	J.R.R. Tolkien	1937	Fantasy/Adventure	https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg	2025-07-27 16:08:34.048129	\N
c75d8cd1-78bd-445b-9c80-ab6c0ca6daeb	550e8400-e29b-41d4-a716-446655440003	Brave New World	A dystopian society built on technology and conditioning	Aldous Huxley	1932	Dystopian Fiction	https://www.harpercollins.com/cdn/shop/products/9780063482708_2048x.jpg?v=1708554512	2025-07-27 16:08:34.048129	\N
2528be09-e8c8-456d-ae61-5292986ec782	550e8400-e29b-41d4-a716-446655440004	Spirited Away	A girl enters a magical world to save her parents	Hayao Miyazaki	2001	Fantasy/Family	https://academymuseumstore.org/cdn/shop/products/movieposterredo85_fb84c3bd-7ee7-485d-94ac-c428c6c19801.jpg?v=1654902542	2025-07-27 16:08:34.050429	\N
4635b5d0-5cfb-4b26-8749-44f8c2bea2a3	550e8400-e29b-41d4-a716-446655440004	Your Name	Two teenagers mysteriously swap bodies across time and space	Makoto Shinkai	2016	Romance/Supernatural	https://i.etsystatic.com/39041993/r/il/a03892/4349091806/il_570xN.4349091806_h93p.jpg	2025-07-27 16:08:34.050429	\N
043e5f3f-ceb1-4ce0-8aee-21fa7418d6c7	550e8400-e29b-41d4-a716-446655440004	Princess Mononoke	A young warrior fights to save the forest and its spirits	Hayao Miyazaki	1997	Fantasy/Adventure	https://academymuseumstore.org/cdn/shop/products/printimageredo2.jpg?v=1656520938	2025-07-27 16:08:34.050429	\N
30943df5-db45-45aa-bdc4-f9e9e843019e	550e8400-e29b-41d4-a716-446655440004	Akira	Psychic powers emerge in post-apocalyptic Neo-Tokyo	Katsuhiro Otomo	1988	Sci-Fi/Action	https://www.riekeles.com/storage/app/media/wysiwyg/AKIRA-c0001_poster_02_white.jpg	2025-07-27 16:08:34.050429	\N
dfa8bc3e-418b-4f7e-bd76-6ba05ea06fe7	550e8400-e29b-41d4-a716-446655440004	My Hero Academia: Two Heroes	Young heroes face a new threat at an exhibition	Kenji Nagasaki	2018	Action/Superhero	https://shop.hollywoodtoyposter.com/cdn/shop/files/my-hero-academia-the-movie_11x17jpg.jpg?v=1747605340	2025-07-27 16:08:34.050429	\N
a06853ad-5702-43a2-ba4f-76cf0b01a178	550e8400-e29b-41d4-a716-446655440004	Demon Slayer: Mugen Train	Demon slayers board a train to fight powerful demons	Haruo Sotozaki	2020	Action/Supernatural	https://www.movieposters.com/cdn/shop/products/kimetsu-no-yaiba-mugen-ressha-hen_zpqfdstt_480x.progressive.jpg?v=1613747624	2025-07-27 16:08:34.050429	\N
d693f2cc-b0de-4baa-9cef-e3606e9086d8	550e8400-e29b-41d4-a716-446655440004	Castle in the Sky	A girl and boy search for a legendary floating castle	Hayao Miyazaki	1986	Adventure/Fantasy	https://assets.photowall.com/images/product/poster_crop_hint_arrow.png	2025-07-27 16:08:34.050429	\N
0c294409-0e80-4089-a768-bcdabaa3df75	550e8400-e29b-41d4-a716-446655440004	Ghost in the Shell	A cyborg policewoman hunts a mysterious hacker	Mamoru Oshii	1995	Sci-Fi/Action	https://posteritati.com/posters/000/000/031/595/ghost-in-the-shell-md-web.jpg	2025-07-27 16:08:34.050429	\N
a8679b36-a7aa-4578-a466-9986b6575eec	550e8400-e29b-41d4-a716-446655440004	Weathering with You	A boy meets a girl who can control the weather	Makoto Shinkai	2019	Romance/Supernatural	https://img.moviepostershop.com/weathering-with-you-movie-poster-2020-1020779596.jpg	2025-07-27 16:08:34.050429	\N
c0e16ffa-919f-4a02-b2a0-33801f66897c	550e8400-e29b-41d4-a716-446655440004	Attack on Titan: Chronicle	Humanity fights for survival against giant titans	Tetsuro Araki	2020	Action/Drama	https://image.tmdb.org/t/p/original/1jRrRFmh3t73wqIxzKEkDadCmEC.jpg	2025-07-27 16:08:34.050429	\N
01fbdf11-6ddd-42be-94cc-9a1091283e9b	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	One Piece	A pirate crew searches for the ultimate treasure	Eiichiro Oda	1997	Adventure/Comedy	https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg	2025-07-27 16:08:34.051965	\N
dd32223e-956b-49de-b86d-c251ed6f77fb	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Naruto	A young ninja seeks recognition and dreams of becoming Hokage	Masashi Kishimoto	1999	Action/Adventure	https://upload.wikimedia.org/wikipedia/en/thumb/9/94/NarutoCoverTankobon1.jpg/250px-NarutoCoverTankobon1.jpg	2025-07-27 16:08:34.051965	\N
481c4f92-496b-4b7b-a3a8-a42f912d49c8	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Dragon Ball	A martial artist collects mystical orbs that grant wishes	Akira Toriyama	1984	Action/Adventure	https://i.pinimg.com/474x/a9/36/73/a9367347d367feb41e95236d8b708727.jpg	2025-07-27 16:08:34.051965	\N
f504e8c7-ad5c-4370-8835-d44ed545344e	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Attack on Titan	Humanity battles giant humanoid creatures behind massive walls	Hajime Isayama	2009	Action/Horror	https://i.pinimg.com/originals/6d/6a/45/6d6a4552b29c03b5d2a24783a5209512.jpg	2025-07-27 16:08:34.051965	\N
9450fe52-2639-40c1-9aca-49ac33b523fc	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Death Note	A student finds a notebook that kills anyone whose name is written	Tsugumi Ohba	2003	Supernatural/Thriller	https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Death_Note_Vol_1.jpg/250px-Death_Note_Vol_1.jpg	2025-07-27 16:08:34.051965	\N
16ad7a0f-d9e8-4d1d-920c-95676dd85ec9	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	My Hero Academia	Students train to become professional superheroes	Kohei Horikoshi	2014	Action/Superhero	https://www.viz.com/media/Manga/MyHeroAcademia/MHA_Vol1_200x300.jpg	2025-07-27 16:08:34.051965	\N
97605df5-4af1-4efa-9dbb-a97b81055313	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	One Punch Man	A superhero who can defeat any enemy with a single punch	ONE	2009	Action/Comedy	https://i.pinimg.com/474x/b7/a4/25/b7a4251dc8de74323c8d5d5834730db5.jpg	2025-07-27 16:08:34.051965	\N
ba617ef5-c70b-4cf5-936d-a9367e70c091	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Demon Slayer	A boy becomes a demon slayer to save his sister	Koyoharu Gotouge	2016	Action/Supernatural	https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg/250px-Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg	2025-07-27 16:08:34.051965	\N
69a8409a-c17d-490d-994f-a038742745c5	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Fullmetal Alchemist	Brothers use alchemy to search for the Philosophers Stone	Hiromu Arakawa	2001	Adventure/Dark Fantasy	https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Fullmetal123.jpg/250px-Fullmetal123.jpg	2025-07-27 16:08:34.051965	\N
79fe79f2-d1e5-4b70-b842-3c910fa35583	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Jujutsu Kaisen	Students fight cursed spirits in modern Japan	Gege Akutami	2018	Action/Supernatural	https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Jujutsu_kaisen.jpg/250px-Jujutsu_kaisen.jpg	2025-07-27 16:08:34.051965	\N
430c29e7-090d-46b0-b337-861b82bbb06c	1e1756e6-549e-4db9-a974-e05e9c9181fb	The Legend of Zelda: Breath of the Wild	Open-world adventure in the kingdom of Hyrule	Nintendo EPD	2017	Action/Adventure	https://i.ebayimg.com/images/g/HNsAAOSw47lnzMFA/s-l1600.jpg	2025-07-27 16:08:34.053028	\N
d007a33e-2d18-4bd2-96f9-b72f9a055f27	1e1756e6-549e-4db9-a974-e05e9c9181fb	The Witcher 3: Wild Hunt	Fantasy RPG following monster hunter Geralt of Rivia	CD Projekt Red	2015	RPG/Fantasy	https://www.thewitcher.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fen.7771a7e3.png&w=1920&q=75	2025-07-27 16:08:34.053028	\N
5ee2ddf4-b326-4b8f-9ddd-687b6b70739b	1e1756e6-549e-4db9-a974-e05e9c9181fb	Red Dead Redemption 2	Western-themed action-adventure in an open world	Rockstar Games	2018	Action/Western	https://i.ebayimg.com/images/g/HNsAAOSw47lnzMFA/s-l1600.jpg	2025-07-27 16:08:34.053028	\N
98623796-96e6-4cf1-934d-7bfb08a5cf2a	1e1756e6-549e-4db9-a974-e05e9c9181fb	God of War	Norse mythology adventure with Kratos and his son	Santa Monica Studio	2018	Action/Adventure	https://gmedia.playstation.com/is/image/SIEPDC/god-of-war-normal-hero-01-ps4-us-26jun17?$100px$	2025-07-27 16:08:34.053028	\N
e64bf60e-2ce3-46e3-b206-1429e6596ca2	1e1756e6-549e-4db9-a974-e05e9c9181fb	Super Mario Odyssey	Mario travels across kingdoms to rescue Princess Peach	Nintendo EPD	2017	Platform/Adventure	https://i.etsystatic.com/27898982/r/il/1551e3/4352055688/il_570xN.4352055688_l91w.jpg	2025-07-27 16:08:34.053028	\N
0a6d071c-dcea-4c6a-8c18-f3601cb03a1f	1e1756e6-549e-4db9-a974-e05e9c9181fb	Cyberpunk 2077	Futuristic RPG set in the dystopian Night City	CD Projekt Red	2020	RPG/Sci-Fi	https://www.rpgfan.com/wp-content/uploads/2020/07/Cyberpunk-2077-Cover-Art-Glamour-Shot.jpg	2025-07-27 16:08:34.053028	\N
35904f43-8b64-450a-8208-b274ce800324	1e1756e6-549e-4db9-a974-e05e9c9181fb	The Last of Us Part II	Post-apocalyptic survival horror with Ellie	Naughty Dog	2020	Action/Survival Horror	https://gmedia.playstation.com/is/image/SIEPDC/the-last-of-us-part-ii-desktop-banner-02-en-13nov20?$100px--t$	2025-07-27 16:08:34.053028	\N
ca44bcb9-1a69-4841-889e-e51bf623b47c	1e1756e6-549e-4db9-a974-e05e9c9181fb	Minecraft	Sandbox game about placing blocks and building worlds	Mojang Studios	2011	Sandbox/Survival	https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/Global-Header_Image-Tile_MC-Java-Bedrock_570x321.jpg	2025-07-27 16:08:34.053028	\N
54093060-67a3-4128-abeb-cccf7feb511a	1e1756e6-549e-4db9-a974-e05e9c9181fb	Grand Theft Auto V	Open-world crime game set in Los Santos	Rockstar North	2013	Action/Crime	https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png	2025-07-27 16:08:34.053028	\N
1a02259a-fc84-43ef-930e-6043151a40e9	1e1756e6-549e-4db9-a974-e05e9c9181fb	Elden Ring	Dark fantasy action RPG in the Lands Between	FromSoftware	2022	Action RPG/Dark Fantasy	https://static1.thegamerimages.com/wordpress/wp-content/uploads/2023/01/elden-ring-cover-photo.jpg	2025-07-27 16:08:34.053028	\N
\.


--
-- Data for Name: media_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_types (id, name, description) FROM stdin;
550e8400-e29b-41d4-a716-446655440001	Movie	Films and movies
550e8400-e29b-41d4-a716-446655440002	Series	TV series and shows
550e8400-e29b-41d4-a716-446655440003	Book	Books and novels
550e8400-e29b-41d4-a716-446655440004	Anime	Anime series and movies
e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Manga	Japanese comics and graphic novels
1e1756e6-549e-4db9-a974-e05e9c9181fb	Video Game	Video games and interactive media
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, content, type, is_read, reference_id, reference_type, created_at, actor_id) FROM stdin;
16f46938-9f7e-4fcf-8fc8-6c328d73d2af	a688cb56-0dca-466b-840f-e277a3d1431d	Thread liked	samiulshemul66 liked your thread 'rhrrrrrr'	thread_like	t	9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	thread	2025-07-05 23:04:29.877057	11cfd680-2c4c-43fd-aed0-7ba80604f411
9233abdf-5e91-446b-8ccb-5f584f3ccd49	11cfd680-2c4c-43fd-aed0-7ba80604f411	New club member	vemita6946 joined Sci-Fi Book Club	club_join	f	1153d21a-30da-4240-878c-9bbf2bc268e0	club	2025-07-07 10:01:02.800303	4a754586-c9bd-4c47-8599-a9f34e309464
8a8c5b22-3809-4faf-be62-e02ced82b2f6	a688cb56-0dca-466b-840f-e277a3d1431d	New club member	vemita6946 joined Sci-Fi Book Club	club_join	f	1153d21a-30da-4240-878c-9bbf2bc268e0	club	2025-07-07 10:01:02.889259	4a754586-c9bd-4c47-8599-a9f34e309464
51053e79-64c2-4a0d-b82e-d49009f57774	a688cb56-0dca-466b-840f-e277a3d1431d	New club member	vemita6946 joined Sci-Fi Movie Club	club_join	f	68787b29-734e-4b10-a4bf-401f1ae3e3b6	club	2025-07-07 10:01:12.107644	4a754586-c9bd-4c47-8599-a9f34e309464
673ab8f3-b361-4b09-b8b0-67657b168cd7	a688cb56-0dca-466b-840f-e277a3d1431d	New thread in Sci-Fi Book Club	vemita6946 created 'Sir' in Sci-Fi Book Club	club_thread_created	f	e226e86d-759c-4dd5-9a6e-093865d9a8c2	thread	2025-07-07 10:03:52.085589	4a754586-c9bd-4c47-8599-a9f34e309464
854426d0-3621-45d1-a0d9-df1ae7415dd8	11cfd680-2c4c-43fd-aed0-7ba80604f411	New thread in Sci-Fi Book Club	vemita6946 created 'Sir' in Sci-Fi Book Club	club_thread_created	t	e226e86d-759c-4dd5-9a6e-093865d9a8c2	thread	2025-07-07 10:03:52.050432	4a754586-c9bd-4c47-8599-a9f34e309464
892c7142-4745-45ff-8284-b11c7b1c51ee	4a754586-c9bd-4c47-8599-a9f34e309464	Thread liked	samiulshemul66 liked your thread 'Sir'	thread_like	t	e226e86d-759c-4dd5-9a6e-093865d9a8c2	thread	2025-07-07 10:11:20.974485	11cfd680-2c4c-43fd-aed0-7ba80604f411
59ec5940-72cc-4b2f-a0b1-b129c6240bb0	a688cb56-0dca-466b-840f-e277a3d1431d	Thread liked	vemita6946 liked your thread 'kochu'	thread_like	f	c660eca2-a023-446f-a193-d829dc735275	thread	2025-07-07 23:00:03.666714	4a754586-c9bd-4c47-8599-a9f34e309464
d1fae013-e79f-4dd8-8c59-c3438f6ee49a	a688cb56-0dca-466b-840f-e277a3d1431d	Thread disliked	vemita6946 disliked your thread 'kochu'	thread_dislike	f	c660eca2-a023-446f-a193-d829dc735275	thread	2025-07-07 23:00:18.904595	4a754586-c9bd-4c47-8599-a9f34e309464
f7500912-79d5-48fc-a0ea-d5c00178ca4b	a688cb56-0dca-466b-840f-e277a3d1431d	Thread liked	vemita6946 liked your thread 'kochu'	thread_like	f	c660eca2-a023-446f-a193-d829dc735275	thread	2025-07-07 23:05:23.442277	4a754586-c9bd-4c47-8599-a9f34e309464
57d6818e-c1b3-4f9c-923c-66133b6007e4	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	New club member	bangi joined sample_value_club	club_join	f	8825011e-38ce-48da-b6e5-2fad2b44df69	club	2025-07-27 04:05:24.702981	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2
aa3ea5c3-ba89-4530-81a5-0f04463ee342	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	New thread in sample_value_club	bangi created 'ekta sample thread' in sample_value_club	club_thread_created	f	d6f3608f-3e95-4b9d-ac07-c17f34556e24	thread	2025-07-27 13:36:58.418645	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2
\.


--
-- Data for Name: thread_dislikes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thread_dislikes (id, created_at, thread_id, user_id) FROM stdin;
f1dc118e-6622-436a-be1e-db48b3cc6cad	2025-07-05 20:23:21.574131	fd43fa7a-a60b-4349-bc41-533580643fc0	11cfd680-2c4c-43fd-aed0-7ba80604f411
\.


--
-- Data for Name: thread_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thread_images (id, content_type, file_size, image_name, image_url, uploaded_at, thread_id) FROM stdin;
480b8932-b184-48c8-a396-a8ea63162818	image/png	48578	basic_acc.png	uploads/thread-images/thread_c119bf7e-6f39-450c-835e-ce752b862e41_20250704_133929_73047a19.png	2025-07-04 13:39:29.920063	c119bf7e-6f39-450c-835e-ce752b862e41
25536880-301e-483d-949b-b7308a2377b0	image/png	48578	basic_acc.png	uploads/thread-images/thread_d3036ebc-4c9f-45b0-be33-2f25a7569d5b_20250704_134137_032bf8bb.png	2025-07-04 13:41:37.157276	d3036ebc-4c9f-45b0-be33-2f25a7569d5b
3bb0cfcc-816e-4872-bf39-186ce194f3bc	image/png	48578	basic_acc.png	uploads/thread-images/thread_0d39c01b-8341-4dc0-aedd-8c8dcb3b9bf3_20250704_134342_f032d605.png	2025-07-04 13:43:42.836051	0d39c01b-8341-4dc0-aedd-8c8dcb3b9bf3
eaa70750-06b9-4168-bda0-adc349ea79a2	image/png	52557	complex_acc.png	uploads/thread-images/thread_2b29e7aa-4530-4b65-991b-0846f8438b7c_20250704_135945_0fdb5d3b.png	2025-07-04 13:59:45.057687	2b29e7aa-4530-4b65-991b-0846f8438b7c
c6a890cb-4e3a-40a7-86b4-e50d448f02cc	image/png	48578	basic_acc.png	uploads/thread-images/thread_7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd_20250704_141938_049fe14e.png	2025-07-04 14:19:38.135972	7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd
80a98513-d8d3-4c87-beea-adc4f0ebc769	image/png	48578	basic_acc.png	uploads/thread-images/thread_b323a92e-f9bc-455b-b458-ae4a5f3674d9_20250704_153607_0b5a3c49.png	2025-07-04 15:36:07.175638	b323a92e-f9bc-455b-b458-ae4a5f3674d9
02ddbbd9-374f-4b4c-b8cd-38c361b1f60c	image/png	52557	complex_acc.png	uploads/thread-images/thread_2bab3d09-8e22-492a-81f0-63c0630bef53_20250704_160834_3eda412c.png	2025-07-04 16:08:34.419201	2bab3d09-8e22-492a-81f0-63c0630bef53
4385c7f3-80f4-44e4-883d-9be6408db308	image/jpeg	137463	JF_pic.jpg	uploads/thread_d6f3608f-3e95-4b9d-ac07-c17f34556e24_20250727_133658_d8246960.jpg	2025-07-27 13:36:58.398636	d6f3608f-3e95-4b9d-ac07-c17f34556e24
\.


--
-- Data for Name: thread_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thread_likes (id, created_at, thread_id, user_id) FROM stdin;
e51ffdd7-e3da-4406-9c2b-f5e746034ce3	2025-07-04 19:30:59.898604	c660eca2-a023-446f-a193-d829dc735275	11cfd680-2c4c-43fd-aed0-7ba80604f411
9eb4a1f2-4a86-414b-af41-740deb1f449d	2025-07-04 21:23:34.433361	d3036ebc-4c9f-45b0-be33-2f25a7569d5b	a688cb56-0dca-466b-840f-e277a3d1431d
4f581f48-1caf-41a8-b48f-e9aa4b503ee1	2025-07-04 22:20:05.924275	2bab3d09-8e22-492a-81f0-63c0630bef53	a688cb56-0dca-466b-840f-e277a3d1431d
d48caf36-711c-4d35-92bb-576b27050268	2025-07-05 09:52:00.328878	e854452d-a967-4d01-ae54-aadbc09e12fc	a688cb56-0dca-466b-840f-e277a3d1431d
d745f6f2-c06c-4e69-8a7e-fdeaf78921fc	2025-07-05 09:54:22.724095	c660eca2-a023-446f-a193-d829dc735275	a688cb56-0dca-466b-840f-e277a3d1431d
99888179-9ac2-4ad7-ae36-e11e198ecb45	2025-07-05 14:30:39.489774	fd43fa7a-a60b-4349-bc41-533580643fc0	a688cb56-0dca-466b-840f-e277a3d1431d
f586beea-7fdf-4c0a-8a1d-bf862096c06d	2025-07-05 23:04:29.851625	9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	11cfd680-2c4c-43fd-aed0-7ba80604f411
5154e4ad-73e7-4ad3-9ccc-ada6618c74e0	2025-07-07 10:11:20.949573	e226e86d-759c-4dd5-9a6e-093865d9a8c2	11cfd680-2c4c-43fd-aed0-7ba80604f411
c7c54765-9f09-4073-a63c-dd51b8d438c8	2025-07-07 23:05:23.282505	c660eca2-a023-446f-a193-d829dc735275	4a754586-c9bd-4c47-8599-a9f34e309464
1be57b41-dfee-410f-84e2-8d6db8e7a5c0	2025-07-26 21:49:15.519389	37839c26-ae93-409e-8dc0-c63910b9eb04	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
\.


--
-- Data for Name: threads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.threads (id, club_id, created_by, title, content, view_count, comment_count, is_pinned, is_locked, created_at, updated_at, like_count, dislike_count, last_activity_at) FROM stdin;
b323a92e-f9bc-455b-b458-ae4a5f3674d9	452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d	rayan boss	well	0	0	f	f	2025-07-04 15:36:07.077436	\N	0	0	\N
7cec4af6-88bf-435c-8813-732432adb428	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	fg	hi	8	2	f	f	2025-07-03 23:29:02.377085	\N	0	0	2025-07-27 04:05:02.959138
f7d27d01-9de4-43cf-aca4-608caa7b5327	0c167685-5bed-45be-aa67-3d682f5f62b6	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	asdff	qerw	9	1	f	f	2025-07-12 19:27:31.269102	\N	0	0	2025-07-27 02:24:01.230209
d6f3608f-3e95-4b9d-ac07-c17f34556e24	8825011e-38ce-48da-b6e5-2fad2b44df69	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	ekta sample thread	ekta sample thread khullam tomar jonno	14	0	f	f	2025-07-27 13:36:58.36702	\N	0	0	2025-07-27 13:59:17.407638
fd43fa7a-a60b-4349-bc41-533580643fc0	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	check	asc	52	8	f	f	2025-07-04 13:42:38.040383	2025-07-04 20:49:25.063101	1	1	2025-07-27 13:59:18.130962
c660eca2-a023-446f-a193-d829dc735275	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	kochu	gechu	53	6	f	f	2025-07-04 16:04:56.165374	\N	3	0	2025-07-27 13:59:18.235478
2bab3d09-8e22-492a-81f0-63c0630bef53	8612a07b-91fc-4177-b326-765af2aa76ad	a688cb56-0dca-466b-840f-e277a3d1431d	kochu	kochu	5	1	f	f	2025-07-04 16:08:34.335934	\N	1	0	2025-07-27 02:24:02.045237
d3036ebc-4c9f-45b0-be33-2f25a7569d5b	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	rhrrrrrr	rrr	7	0	f	f	2025-07-04 13:41:37.115403	\N	1	0	2025-07-27 02:24:02.181841
7c56fcc5-a2aa-4a72-a1cd-de8c2912e4e0	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	chol	chol chol	1	0	f	f	2025-07-04 13:38:59.944748	\N	0	0	2025-07-27 02:24:02.285934
c119bf7e-6f39-450c-835e-ce752b862e41	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	akash	pataal	1	0	f	f	2025-07-04 13:39:29.861977	\N	0	0	2025-07-27 02:24:02.285997
1265a499-aada-4da1-8455-f1b07b60db43	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	akash	pataal	1	0	f	f	2025-07-04 13:39:41.491691	\N	0	0	2025-07-27 02:24:02.285629
adf56cb5-b51a-48a6-829f-641dc6d90e85	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	gh	lala	1	0	f	f	2025-07-04 13:38:13.572881	\N	0	0	2025-07-27 02:24:02.286108
798a84a8-5136-4241-aca9-af73e13d93ee	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	k	j	1	0	f	f	2025-07-04 13:40:27.681744	\N	0	0	2025-07-27 02:24:02.381617
0d39c01b-8341-4dc0-aedd-8c8dcb3b9bf3	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	hgf	asd	1	0	f	f	2025-07-04 13:43:42.811431	\N	0	0	2025-07-27 02:24:02.481356
2b29e7aa-4530-4b65-991b-0846f8438b7c	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	qq	asd	1	0	f	f	2025-07-04 13:59:44.924437	\N	0	0	2025-07-27 02:24:02.697806
1c1573d0-e2d1-42ce-b49f-9b3a83616f66	452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d	rayan	boss	1	0	f	f	2025-07-04 15:35:33.323543	\N	0	0	2025-07-27 02:24:02.979747
e504f340-20fa-4102-a4c4-584d00ba1bcb	0c167685-5bed-45be-aa67-3d682f5f62b6	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	afd	ewr	7	0	f	f	2025-07-12 19:26:16.795334	\N	0	0	2025-07-27 02:24:03.266613
7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	asdfgh	qwerty	10	3	f	f	2025-07-04 14:19:37.803399	\N	0	0	2025-07-27 04:05:02.425664
e226e86d-759c-4dd5-9a6e-093865d9a8c2	1153d21a-30da-4240-878c-9bbf2bc268e0	4a754586-c9bd-4c47-8599-a9f34e309464	Sir	Is good boy	17	2	f	f	2025-07-07 10:03:51.68429	\N	1	0	2025-07-27 04:05:02.756311
37839c26-ae93-409e-8dc0-c63910b9eb04	e7182d74-efb3-4427-bf94-4dc6a769c5e5	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	about baal	sjgoisdh odbvuibgilbsd bscnxl nskfjaij jahcj	15	2	f	f	2025-07-26 21:49:05.553985	\N	1	0	2025-07-27 04:05:02.846302
e854452d-a967-4d01-ae54-aadbc09e12fc	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	no	hey boy	8	2	f	f	2025-07-03 23:28:30.127395	\N	1	0	2025-07-27 04:05:02.898712
ba1cab1d-705f-475b-b485-c5add714f489	e7182d74-efb3-4427-bf94-4dc6a769c5e5	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	afnaiuf asjejeejejej	sdijfjroireoir pasopfiacka ljjsjs	3	0	f	f	2025-07-26 21:50:32.408986	\N	0	0	2025-07-27 13:40:14.775597
9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	rhrrrrrr	rrr	16	5	f	f	2025-07-04 13:41:46.256042	\N	1	0	2025-07-27 13:40:22.697775
\.


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_achievements (id, achievement_type, description, earned_at, icon, title, user_id) FROM stdin;
\.


--
-- Data for Name: user_clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_clubs (user_id, club_id, joined_at) FROM stdin;
11cfd680-2c4c-43fd-aed0-7ba80604f411	1153d21a-30da-4240-878c-9bbf2bc268e0	2025-07-02 06:40:23.627216
a688cb56-0dca-466b-840f-e277a3d1431d	8612a07b-91fc-4177-b326-765af2aa76ad	2025-07-03 21:09:04.35198
a688cb56-0dca-466b-840f-e277a3d1431d	68787b29-734e-4b10-a4bf-401f1ae3e3b6	2025-07-04 13:40:58.556089
a688cb56-0dca-466b-840f-e277a3d1431d	1153d21a-30da-4240-878c-9bbf2bc268e0	2025-07-04 16:04:36.015609
11cfd680-2c4c-43fd-aed0-7ba80604f411	8612a07b-91fc-4177-b326-765af2aa76ad	2025-07-05 20:55:39.162862
4a754586-c9bd-4c47-8599-a9f34e309464	5e5fe910-bd7c-464d-957f-fbcfadd72854	2025-07-07 06:58:56.53699
4a754586-c9bd-4c47-8599-a9f34e309464	1153d21a-30da-4240-878c-9bbf2bc268e0	2025-07-07 10:01:02.629699
4a754586-c9bd-4c47-8599-a9f34e309464	68787b29-734e-4b10-a4bf-401f1ae3e3b6	2025-07-07 10:01:12.091243
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	0c167685-5bed-45be-aa67-3d682f5f62b6	2025-07-12 19:23:08.515202
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	aa88ed56-9e54-4aa3-b33b-b16e1da02e8c	2025-07-14 15:41:11.68161
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	57e7af79-b324-4e3c-91af-5f5f92317e0e	2025-07-14 16:11:55.867208
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	8825011e-38ce-48da-b6e5-2fad2b44df69	2025-07-14 16:17:48.110048
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	e7182d74-efb3-4427-bf94-4dc6a769c5e5	2025-07-14 16:20:26.871679
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	ddc02c3d-d7c6-43c9-81b2-a2d603c5bc4c	2025-07-14 16:24:54.300775
a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	8825011e-38ce-48da-b6e5-2fad2b44df69	2025-07-27 04:05:24.677649
\.


--
-- Data for Name: user_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_statistics (user_id, clubs_joined, comments_posted, events_attended, likes_received, threads_created, updated_at) FROM stdin;
\.


--
-- Data for Name: user_thread_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_thread_reactions (id, created_at, reaction_type, updated_at, thread_id, user_id) FROM stdin;
\.


--
-- Data for Name: user_thread_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_thread_views (id, viewed_at, thread_id, user_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, username, role, profile_pic, clerk_user_id, oauth_provider, oauth_provider_id, is_email_verified, first_name, last_name, oauth_profile_picture, last_oauth_sync, primary_auth_method, last_login_at, last_login_method, account_created_via, created_at, updated_at) FROM stdin;
0b7c0688-b9bb-42ad-ab00-de26606283fa	admin@mediasphere.com	\N	admin	admin	\N	\N	\N	\N	t	System	Administrator	\N	\N	local	\N	\N	system	2025-06-30 08:55:44.46577	\N
3281e9dd-b913-4d48-836f-0b5539d89999	john.doe@example.com	\N	johndoe	user	\N	\N	\N	\N	t	John	Doe	\N	\N	local	\N	\N	local	2025-06-30 08:55:44.46577	\N
c8b5cc5f-a540-4e6a-8bdf-247a8e4c117c	jane.smith@example.com	\N	janesmith	user	\N	\N	\N	\N	t	Jane	Smith	\N	\N	oauth	\N	\N	google	2025-06-30 08:55:44.46577	\N
f9ac75cc-7701-455f-9e16-2e62e14d569d	mike.wilson@example.com	\N	mikewilson	moderator	\N	\N	\N	\N	t	Mike	Wilson	\N	\N	local	\N	\N	local	2025-06-30 08:55:44.46577	\N
049f24c8-9dda-4707-afac-e9b230134b16	lerop52438@fenexy.com	\N	lerop52438	user	\N	user_2zXITi66qtULkHMZPyPh7orTRAw	clerk	user_2zXITi66qtULkHMZPyPh7orTRAw	t	\N	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yeXNxemZPcHNRUFJvNnI4SE5vaUVWRFQ5Z0kiLCJyaWQiOiJ1c2VyXzJ6WElUaTY2cXRVTGtITVpQeVBoN29yVFJBdyJ9	2025-07-07 06:56:19.208553	oauth	2025-07-07 06:56:19.208607	clerk_clerk	clerk_clerk	2025-07-07 06:56:01.345317	2025-07-07 06:56:19.208603
4a754586-c9bd-4c47-8599-a9f34e309464	vemita6946@fenexy.com	\N	vemita6946	user	\N	user_2zXJUWK6wdb9exh1useuDI57ljK	clerk	user_2zXJUWK6wdb9exh1useuDI57ljK	t	\N	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yeXNxemZPcHNRUFJvNnI4SE5vaUVWRFQ5Z0kiLCJyaWQiOiJ1c2VyXzJ6WEpVV0s2d2RiOWV4aDF1c2V1REk1N2xqSyJ9	2025-07-11 21:13:27.828874	oauth	2025-07-11 21:13:27.831919	clerk_clerk	clerk_clerk	2025-07-07 06:58:20.505994	2025-07-11 21:13:27.831905
a688cb56-0dca-466b-840f-e277a3d1431d	suman.sinan@gmail.com	\N	suman.sinan	user	\N	user_2zDieq0ppn3qgK1IfEdUNIboeUf	clerk	user_2zDieq0ppn3qgK1IfEdUNIboeUf	t	Suman Ahmed	Sinan	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yekRpZXNod1RBd1FmZ3pTT25URG5XS2pZcEgifQ	2025-07-07 06:47:34.239969	oauth	2025-07-07 06:47:34.245615	clerk_google	clerk_google	2025-06-30 09:07:41.939693	2025-07-07 06:47:34.245592
11cfd680-2c4c-43fd-aed0-7ba80604f411	samiulshemul66@gmail.com	\N	samiulshemul66	user	\N	user_2zGj14nbjDmQueZukOkJR1HIdWa	clerk	user_2zGj14nbjDmQueZukOkJR1HIdWa	t	Shemul	Samiul	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yekdqMThnSG82cTc2RU4yUDFlUFpNMVVtRlcifQ	2025-07-09 17:18:27.1942	oauth	2025-07-09 17:18:27.194575	clerk_google	clerk_google	2025-07-01 10:01:30.565671	2025-07-09 17:18:27.194564
59bca9be-0a2d-41a3-b152-f2dc24449cd1	fohoju@fxzig.com	\N	fohoju	user	\N	user_2zmG9YOeyviasga5oE73Ec7fklw	clerk	user_2zmG9YOeyviasga5oE73Ec7fklw	t	\N	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yemxxWWpENkFzUXpWaUFneHAyVHZpNkJSQksiLCJyaWQiOiJ1c2VyXzJ6bUc5WU9leXZpYXNnYTVvRTczRWM3ZmtsdyJ9	2025-07-12 19:59:18.725046	oauth	2025-07-12 19:59:18.725049	clerk_clerk	clerk_clerk	2025-07-12 19:58:06.656218	2025-07-12 19:59:18.725049
a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	bangi@gmail.com	\N	bangi	user	\N	user_30QYoUKmDOUWEbEM9rTL0BhhzOq	clerk	user_30QYoUKmDOUWEbEM9rTL0BhhzOq	f	\N	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yelc0YlNPZUM3VlhuNW1XRGdaNFFtZGlsaWoiLCJyaWQiOiJ1c2VyXzMwUVlvVUttRE9VV0ViRU05clRMMEJoaHpPcSJ9	2025-07-27 13:59:15.294165	clerk	2025-07-27 13:59:15.29417	clerk_clerk	clerk_clerk	2025-07-27 02:23:58.708779	2025-07-27 13:59:15.294169
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	abdullah991r@gmail.com	\N	abdullah991r	user	\N	user_2zW4r4fnKLe52bJMBEFZ03pLAm0	clerk	user_2zW4r4fnKLe52bJMBEFZ03pLAm0	t	Abdullah	Faiyaz	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yelc0ckU3RnFmSFRVNUhtaVlwNzRhSjBubTEifQ	2025-07-27 02:18:18.902972	oauth	2025-07-27 02:18:18.902982	clerk_google	clerk_google	2025-07-12 16:57:56.937479	2025-07-27 02:18:18.90298
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: club_leave_logs club_leave_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_leave_logs
    ADD CONSTRAINT club_leave_logs_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);


--
-- Name: comment_likes comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: event_interests event_interests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_interests
    ADD CONSTRAINT event_interests_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: media_types media_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_types
    ADD CONSTRAINT media_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: thread_dislikes thread_dislikes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_dislikes
    ADD CONSTRAINT thread_dislikes_pkey PRIMARY KEY (id);


--
-- Name: thread_images thread_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_images
    ADD CONSTRAINT thread_images_pkey PRIMARY KEY (id);


--
-- Name: thread_likes thread_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_likes
    ADD CONSTRAINT thread_likes_pkey PRIMARY KEY (id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (id);


--
-- Name: thread_dislikes uk7xm2kesod7sy6bgk3em2awae5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_dislikes
    ADD CONSTRAINT uk7xm2kesod7sy6bgk3em2awae5 UNIQUE (thread_id, user_id);


--
-- Name: user_achievements uk9j9st0f2u4y1vweviet0pa78l; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT uk9j9st0f2u4y1vweviet0pa78l UNIQUE (user_id, achievement_type);


--
-- Name: user_thread_reactions ukfsqsa130a1in1j0hq54t5581o; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_reactions
    ADD CONSTRAINT ukfsqsa130a1in1j0hq54t5581o UNIQUE (user_id, thread_id);


--
-- Name: user_thread_views ukga3vu9lre40ooe27o2alhcotv; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_views
    ADD CONSTRAINT ukga3vu9lre40ooe27o2alhcotv UNIQUE (user_id, thread_id);


--
-- Name: thread_likes ukitvr715te46x51tv3ok4gmxmw; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_likes
    ADD CONSTRAINT ukitvr715te46x51tv3ok4gmxmw UNIQUE (thread_id, user_id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_clubs user_clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_clubs
    ADD CONSTRAINT user_clubs_pkey PRIMARY KEY (user_id, club_id);


--
-- Name: user_statistics user_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_statistics
    ADD CONSTRAINT user_statistics_pkey PRIMARY KEY (user_id);


--
-- Name: user_thread_reactions user_thread_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_reactions
    ADD CONSTRAINT user_thread_reactions_pkey PRIMARY KEY (id);


--
-- Name: user_thread_views user_thread_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_views
    ADD CONSTRAINT user_thread_views_pkey PRIMARY KEY (id);


--
-- Name: users users_clerk_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_clerk_user_id_key UNIQUE (clerk_user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_oauth_provider_oauth_provider_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_oauth_provider_oauth_provider_id_key UNIQUE (oauth_provider, oauth_provider_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clubs clubs_media_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_media_type_id_fkey FOREIGN KEY (media_type_id) REFERENCES public.media_types(id) ON DELETE CASCADE;


--
-- Name: comments comments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE;


--
-- Name: events events_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comment_likes fk3wa5u7bs1p1o9hmavtgdgk1go; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT fk3wa5u7bs1p1o9hmavtgdgk1go FOREIGN KEY (comment_id) REFERENCES public.comments(id);


--
-- Name: notifications fk4sd9fik0uthbk6d9rsxco4uja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk4sd9fik0uthbk6d9rsxco4uja FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: club_leave_logs fk4ydkv3u4rcjwbdr2egsb0rfu0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_leave_logs
    ADD CONSTRAINT fk4ydkv3u4rcjwbdr2egsb0rfu0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: activity_logs fk5bm1lt4f4eevt8lv2517soakd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk5bm1lt4f4eevt8lv2517soakd FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comment_likes fk6h3lbneryl5pyb9ykaju7werx; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT fk6h3lbneryl5pyb9ykaju7werx FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_achievements fk6vt5fpu0uta41vny1x6vpk45k; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT fk6vt5fpu0uta41vny1x6vpk45k FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_thread_views fk7icx44y7ixrwmtp147lb8lktu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_views
    ADD CONSTRAINT fk7icx44y7ixrwmtp147lb8lktu FOREIGN KEY (thread_id) REFERENCES public.threads(id);


--
-- Name: event_interests fk9g9n7h8wvllne60dy1ajtgmtk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_interests
    ADD CONSTRAINT fk9g9n7h8wvllne60dy1ajtgmtk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_thread_reactions fk9xlpbca5ib0ywo6cn5827cymf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_reactions
    ADD CONSTRAINT fk9xlpbca5ib0ywo6cn5827cymf FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: thread_dislikes fkan7n2830ime1kkjavtmuxyn0i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_dislikes
    ADD CONSTRAINT fkan7n2830ime1kkjavtmuxyn0i FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: club_leave_logs fkb2ywxdeq4us4uspvyipl4cq4m; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_leave_logs
    ADD CONSTRAINT fkb2ywxdeq4us4uspvyipl4cq4m FOREIGN KEY (club_id) REFERENCES public.clubs(id);


--
-- Name: activity_logs fkbcf289otcehtwvnr6ohbvqal3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fkbcf289otcehtwvnr6ohbvqal3 FOREIGN KEY (club_id) REFERENCES public.clubs(id);


--
-- Name: thread_likes fkcvxv3q7cnvisk8ov4eoq7tggd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_likes
    ADD CONSTRAINT fkcvxv3q7cnvisk8ov4eoq7tggd FOREIGN KEY (thread_id) REFERENCES public.threads(id);


--
-- Name: thread_likes fkdw6eiuy1qq9jg64x1cj09pnja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_likes
    ADD CONSTRAINT fkdw6eiuy1qq9jg64x1cj09pnja FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: thread_dislikes fkfuv6tl0ivg0h0ctcddp59py4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_dislikes
    ADD CONSTRAINT fkfuv6tl0ivg0h0ctcddp59py4 FOREIGN KEY (thread_id) REFERENCES public.threads(id);


--
-- Name: thread_images fki03773l245kipe2k22klun3xs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread_images
    ADD CONSTRAINT fki03773l245kipe2k22klun3xs FOREIGN KEY (thread_id) REFERENCES public.threads(id);


--
-- Name: user_thread_views fklgjnsx23102n8vi4e5bkhxnlq; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_views
    ADD CONSTRAINT fklgjnsx23102n8vi4e5bkhxnlq FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_statistics fkn3hnvsmybu7g7ntrwpg563sao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_statistics
    ADD CONSTRAINT fkn3hnvsmybu7g7ntrwpg563sao FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_thread_reactions fkqdigbsqptvvwswxillpfpmitq; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thread_reactions
    ADD CONSTRAINT fkqdigbsqptvvwswxillpfpmitq FOREIGN KEY (thread_id) REFERENCES public.threads(id);


--
-- Name: event_interests fksheqtphnyg63jj5b259k7m70m; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_interests
    ADD CONSTRAINT fksheqtphnyg63jj5b259k7m70m FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: media media_media_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_media_type_id_fkey FOREIGN KEY (media_type_id) REFERENCES public.media_types(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: threads threads_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: threads threads_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_clubs user_clubs_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_clubs
    ADD CONSTRAINT user_clubs_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: user_clubs user_clubs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_clubs
    ADD CONSTRAINT user_clubs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

