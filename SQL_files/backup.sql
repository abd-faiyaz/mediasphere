--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
    last_thread_created_at timestamp without time zone
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
    dislike_count integer DEFAULT 0 NOT NULL
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
56933c8d-24ce-4047-85e7-ed8f7bde4ab7	2025-07-03 16:28:52.518662	emni kichui na	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
db70d32a-aac2-42a6-8396-b9cbc36a2fd2	2025-07-03 21:46:04.055509	emni e re	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
3f96a58c-e3b3-49c2-9496-daaf8ceb6e4e	2025-07-03 22:58:50.641051		1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
af9b4e50-ed1a-40ee-a0a2-1e5dc2373f73	2025-07-04 13:40:36.82741		57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d
842a4477-e8e2-42ff-a8f2-a655b1a8028e	2025-07-04 14:21:28.286469	rrrrrrrrrrrrrrrr	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d
572d4db0-c839-45d3-84ec-c4b26885983c	2025-07-04 14:56:56.201272		1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d
b4385c25-fa46-4ada-94f0-6fbcbe18b91a	2025-07-04 15:37:33.207411		452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d
969928e6-0711-4596-8187-52ac43de4d99	2025-07-05 09:30:41.961321		df50b126-de42-412e-9ee0-4d5f2b2412ee	a688cb56-0dca-466b-840f-e277a3d1431d
5e1d40e5-01ee-4dd8-a4e9-c7ca6a0c8f0c	2025-07-05 21:55:35.045381		68787b29-734e-4b10-a4bf-401f1ae3e3b6	11cfd680-2c4c-43fd-aed0-7ba80604f411
048b1a3b-afb1-4b6d-bf53-6e9156dbd8af	2025-07-05 23:05:01.149091		68787b29-734e-4b10-a4bf-401f1ae3e3b6	11cfd680-2c4c-43fd-aed0-7ba80604f411
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clubs (id, media_type_id, name, description, created_by, created_at, last_activity_at, last_thread_created_at) FROM stdin;
5e5fe910-bd7c-464d-957f-fbcfadd72854	06e1bdf9-3b78-4139-a715-07bd0e2c2e86	Sci-Fi TV Series Club	Discussion club for science fiction tv seriess	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	\N
0c167685-5bed-45be-aa67-3d682f5f62b6	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	a b c	def	a688cb56-0dca-466b-840f-e277a3d1431d	2025-06-30 09:08:48.269639	2025-06-30 09:08:48.269639	\N
57e7af79-b324-4e3c-91af-5f5f92317e0e	550e8400-e29b-41d4-a716-446655440001	Sci-Fi Movie Club	Discussion club for science fiction movies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 13:40:27.681744
68787b29-734e-4b10-a4bf-401f1ae3e3b6	a6af7c45-69b8-4157-8a11-9134926034a4	Sci-Fi Movie Club	Discussion club for science fiction movies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 13:42:38.040383
df50b126-de42-412e-9ee0-4d5f2b2412ee	550e8400-e29b-41d4-a716-446655440004	Studio Ghibli Appreciation Society	Dedicated to discussing and analyzing Studio Ghibli films	3281e9dd-b913-4d48-836f-0b5539d89999	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 14:57:51.432997
452c7a0d-2eae-421d-9696-92e7f131254b	a26da08b-7372-4310-a1a4-f26815ca78ac	Sci-Fi Book Club	Discussion club for science fiction books	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-07-04 15:36:07.213565	2025-07-04 15:36:07.213565
8612a07b-91fc-4177-b326-765af2aa76ad	1e1756e6-549e-4db9-a974-e05e9c9181fb	Sumon	baal create	a688cb56-0dca-466b-840f-e277a3d1431d	2025-07-02 09:54:50.097023	2025-07-04 16:08:34.43969	2025-07-04 16:08:34.43969
1153d21a-30da-4240-878c-9bbf2bc268e0	550e8400-e29b-41d4-a716-446655440003	Sci-Fi Book Club	Discussion club for science fiction books	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-07-07 10:03:51.973489	2025-07-07 10:03:51.973489
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
\.


--
-- Data for Name: media_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_types (id, name, description) FROM stdin;
550e8400-e29b-41d4-a716-446655440001	Movie	Films and movies
550e8400-e29b-41d4-a716-446655440002	Series	TV series and shows
550e8400-e29b-41d4-a716-446655440003	Book	Books and novels
550e8400-e29b-41d4-a716-446655440004	Anime	Anime series and movies
a6af7c45-69b8-4157-8a11-9134926034a4	Movie	Feature films and documentaries
06e1bdf9-3b78-4139-a715-07bd0e2c2e86	TV Series	Television series and shows
a26da08b-7372-4310-a1a4-f26815ca78ac	Book	Books, novels, and literature
19741ba9-5a85-459b-91ef-6657d5ba22c7	Anime	Japanese animation series and films
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
\.


--
-- Data for Name: threads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.threads (id, club_id, created_by, title, content, view_count, comment_count, is_pinned, is_locked, created_at, updated_at, like_count, dislike_count) FROM stdin;
adf56cb5-b51a-48a6-829f-641dc6d90e85	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	gh	lala	0	0	f	f	2025-07-04 13:38:13.572881	\N	0	0
7c56fcc5-a2aa-4a72-a1cd-de8c2912e4e0	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	chol	chol chol	0	0	f	f	2025-07-04 13:38:59.944748	\N	0	0
c119bf7e-6f39-450c-835e-ce752b862e41	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	akash	pataal	0	0	f	f	2025-07-04 13:39:29.861977	\N	0	0
1265a499-aada-4da1-8455-f1b07b60db43	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	akash	pataal	0	0	f	f	2025-07-04 13:39:41.491691	\N	0	0
798a84a8-5136-4241-aca9-af73e13d93ee	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	k	j	0	0	f	f	2025-07-04 13:40:27.681744	\N	0	0
0d39c01b-8341-4dc0-aedd-8c8dcb3b9bf3	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	hgf	asd	0	0	f	f	2025-07-04 13:43:42.811431	\N	0	0
2b29e7aa-4530-4b65-991b-0846f8438b7c	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	qq	asd	0	0	f	f	2025-07-04 13:59:44.924437	\N	0	0
1c1573d0-e2d1-42ce-b49f-9b3a83616f66	452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d	rayan	boss	0	0	f	f	2025-07-04 15:35:33.323543	\N	0	0
b323a92e-f9bc-455b-b458-ae4a5f3674d9	452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d	rayan boss	well	0	0	f	f	2025-07-04 15:36:07.077436	\N	0	0
c660eca2-a023-446f-a193-d829dc735275	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	kochu	gechu	47	6	f	f	2025-07-04 16:04:56.165374	\N	3	0
7cec4af6-88bf-435c-8813-732432adb428	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	fg	hi	6	2	f	f	2025-07-03 23:29:02.377085	\N	0	0
e226e86d-759c-4dd5-9a6e-093865d9a8c2	1153d21a-30da-4240-878c-9bbf2bc268e0	4a754586-c9bd-4c47-8599-a9f34e309464	Sir	Is good boy	15	2	f	f	2025-07-07 10:03:51.68429	\N	1	0
9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	rhrrrrrr	rrr	12	5	f	f	2025-07-04 13:41:46.256042	\N	1	0
d3036ebc-4c9f-45b0-be33-2f25a7569d5b	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	rhrrrrrr	rrr	6	0	f	f	2025-07-04 13:41:37.115403	\N	1	0
2bab3d09-8e22-492a-81f0-63c0630bef53	8612a07b-91fc-4177-b326-765af2aa76ad	a688cb56-0dca-466b-840f-e277a3d1431d	kochu	kochu	4	1	f	f	2025-07-04 16:08:34.335934	\N	1	0
e854452d-a967-4d01-ae54-aadbc09e12fc	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	no	hey boy	6	2	f	f	2025-07-03 23:28:30.127395	\N	1	0
7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	asdfgh	qwerty	8	3	f	f	2025-07-04 14:19:37.803399	\N	0	0
fd43fa7a-a60b-4349-bc41-533580643fc0	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	check	asc	40	8	f	f	2025-07-04 13:42:38.040383	2025-07-04 20:49:25.063101	1	1
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
\.


--
-- Data for Name: user_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_statistics (user_id, clubs_joined, comments_posted, events_attended, likes_received, threads_created, updated_at) FROM stdin;
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
-- Name: user_statistics fkn3hnvsmybu7g7ntrwpg563sao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_statistics
    ADD CONSTRAINT fkn3hnvsmybu7g7ntrwpg563sao FOREIGN KEY (user_id) REFERENCES public.users(id);


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

