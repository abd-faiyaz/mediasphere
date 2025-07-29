--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Ubuntu 17.5-0ubuntu0.25.04.1)
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-0ubuntu0.25.04.1)

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
-- Name: ai_generated_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_generated_content (
    id uuid NOT NULL,
    content_data text NOT NULL,
    content_hash character varying(64) NOT NULL,
    content_type character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone,
    metadata jsonb,
    source_reference_id uuid,
    source_reference_type character varying(255),
    updated_at timestamp(6) without time zone,
    CONSTRAINT ai_generated_content_content_type_check CHECK (((content_type)::text = ANY ((ARRAY['SUMMARY'::character varying, 'QUIZ_QUESTIONS'::character varying, 'SENTIMENT_ANALYSIS'::character varying, 'TOPIC_EXTRACTION'::character varying, 'KEY_INSIGHTS'::character varying, 'RECOMMENDATIONS'::character varying])::text[]))),
    CONSTRAINT ai_generated_content_source_reference_type_check CHECK (((source_reference_type)::text = ANY ((ARRAY['MEDIA'::character varying, 'CLUB'::character varying, 'THREAD'::character varying])::text[])))
);


ALTER TABLE public.ai_generated_content OWNER TO postgres;

--
-- Name: TABLE ai_generated_content; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.ai_generated_content IS 'Caches AI-generated content to avoid redundant API calls';


--
-- Name: ai_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_requests (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    error_message text,
    processing_time_ms integer,
    request_data text NOT NULL,
    request_type character varying(255) NOT NULL,
    response_data text,
    status character varying(255),
    updated_at timestamp(6) without time zone,
    user_id uuid NOT NULL,
    CONSTRAINT ai_requests_request_type_check CHECK (((request_type)::text = ANY ((ARRAY['SUMMARY'::character varying, 'QUIZ'::character varying, 'ANALYSIS'::character varying, 'RECOMMENDATION'::character varying])::text[]))),
    CONSTRAINT ai_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


ALTER TABLE public.ai_requests OWNER TO postgres;

--
-- Name: TABLE ai_requests; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.ai_requests IS 'Stores all AI service requests and responses for audit and caching';


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
    linked_media_id uuid
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
-- Name: quiz_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    media_id uuid,
    club_id uuid,
    questions jsonb NOT NULL,
    user_answers jsonb,
    score integer DEFAULT 0,
    total_questions integer NOT NULL,
    difficulty_level character varying(20),
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT quiz_sessions_difficulty_level_check CHECK (((difficulty_level)::text = ANY ((ARRAY['EASY'::character varying, 'MEDIUM'::character varying, 'HARD'::character varying])::text[])))
);


ALTER TABLE public.quiz_sessions OWNER TO postgres;

--
-- Name: TABLE quiz_sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.quiz_sessions IS 'Stores quiz attempts and results for users';


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
-- Name: user_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recommended_media_ids jsonb,
    recommended_club_ids jsonb,
    reasoning text,
    recommendation_score numeric(3,2),
    is_viewed boolean DEFAULT false,
    expires_at timestamp without time zone DEFAULT (now() + '7 days'::interval),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_recommendations OWNER TO postgres;

--
-- Name: TABLE user_recommendations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_recommendations IS 'Stores personalized recommendations generated by AI';


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
1840fa74-97c8-4a17-8fdf-0d76197e3e78	member_left	2025-07-28 01:23:47.258774	Abdullah Faiyaz left the club	\N	membership	6f1243c1-f36d-4df2-9197-92cc0d26fb24	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
450622be-a476-4147-8c1a-44b0b787f50a	member_left	2025-07-28 01:32:49.556242	Abdullah Faiyaz left the club	\N	membership	6f1243c1-f36d-4df2-9197-92cc0d26fb24	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
\.


--
-- Data for Name: ai_generated_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_generated_content (id, content_data, content_hash, content_type, created_at, expires_at, metadata, source_reference_id, source_reference_type, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_requests (id, created_at, error_message, processing_time_ms, request_data, request_type, response_data, status, updated_at, user_id) FROM stdin;
82c3f9bb-d7eb-4487-9b1d-279df0d8ebe3	2025-07-28 08:28:17.937302	\N	2806	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Van der Linde Gang Rides Again Thread Content Reunite with fellow outlaws to share stories, screenshots, and shenanigans from Red Dead Redemption 2. Whether youre chasing bounties, exploring the frontier, or just causing chaos with the Van der Linde gang this is your hideout. Discussion Comments\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY:\nThis thread serves as a virtual gathering place for fans of Red Dead Redemption 2 who want to reminisce and share their experiences related to the Van der Linde gang. Participants are encouraged to post stories, screenshots, and general anecdotes about their gameplay, focusing on activities like bounty hunting, exploration, and causing mayhem. Its a space for players to connect and relive their adventures within the Red Dead Redemption 2 world.\n\nKEY_TOPICS:\n*   Red Dead Redemption 2\n*   Van der Linde Gang\n*   Shared Gameplay Experiences\n*   Screenshots & Stories	COMPLETED	2025-07-28 08:28:20.734685	b7b9c032-b899-44fa-9f74-bfcc28881383
a70bee1c-97b5-4341-9954-ac9c39100007	2025-07-28 08:29:20.078959	\N	1740	Please create a detailed summary of the following thread content. Keep the summary to approximately 200 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Van der Linde Gang Rides Again Thread Content Reunite with fellow outlaws to share stories, screenshots, and shenanigans from Red Dead Redemption 2. Whether youre chasing bounties, exploring the frontier, or just causing chaos with the Van der Linde gang this is your hideout. Discussion Comments\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: The "Van der Linde Gang Rides Again" thread serves as a virtual gathering place for Red Dead Redemption 2 players to reminisce and share their experiences within the games world. The core focus is on camaraderie and celebrating the games open-world elements. Users are encouraged to post stories of their adventures, share screenshots of memorable moments, and discuss their experiences, particularly those involving causing mayhem or engaging in outlaw activities similar to the Van der Linde gang. Its a space for players to relive their favorite moments, connect with others who share a passion for the game, and celebrate the games enduring appeal. The thread fosters a sense of community among players who enjoy the freedom and chaos offered by Red Dead Redemption 2.\n\nKEY_TOPICS: [Red Dead Redemption 2, Van der Linde Gang, Sharing Screenshots, Player Stories/Experiences, Open-World Exploration/Chaos]	COMPLETED	2025-07-28 08:29:21.821099	62fedbb1-d6ab-444d-ae7f-2fe0d0165e97
64a3fa1f-d3be-47e4-9bf3-54b9064ca4ee	2025-07-28 14:50:28.337268	\N	3635	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Van der Linde Gang Rides Again Thread Content Reunite with fellow outlaws to share stories, screenshots, and shenanigans from Red Dead Redemption 2. Whether youre chasing bounties, exploring the frontier, or just causing chaos with the Van der Linde gang this is your hideout. Discussion Comments\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: The "Van der Linde Gang Rides Again" thread serves as a virtual campfire for Red Dead Redemption 2 players. It's a space to share experiences, screenshots, and stories of their adventures within the game. The thread encourages players to connect over shared experiences, whether it's engaging in bounty hunting, exploring the open world, or embracing the chaotic spirit of the Van der Linde gang. Overall, the thread fosters community and celebrates the shared love for the game.\n\nKEY_TOPICS: [Red Dead Redemption 2, Van der Linde Gang, Story Sharing, Screenshots, Community]	COMPLETED	2025-07-28 14:50:31.966053	bfbc1f70-c2aa-4c19-9aad-795ed94bf329
18bb1677-b0fa-4e29-95ee-63b666210cb0	2025-07-28 14:50:57.083508	\N	1615	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Van der Linde Gang Rides Again Thread Content Reunite with fellow outlaws to share stories, screenshots, and shenanigans from Red Dead Redemption 2. Whether youre chasing bounties, exploring the frontier, or just causing chaos with the Van der Linde gang this is your hideout. Discussion Comments\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: This thread serves as a virtual gathering place for Red Dead Redemption 2 players, inviting them to share their experiences within the game. Participants are encouraged to post stories, screenshots, and engage in discussions centered around their adventures, particularly those involving the Van der Linde gang. The thread aims to foster a sense of community among players who enjoy exploring the games world, completing missions, and creating their own unique outlaw narratives.\n\nKEY_TOPICS: [Red Dead Redemption 2, Van der Linde Gang, Story Sharing, Screenshots, Community]	COMPLETED	2025-07-28 14:50:58.700202	0b61be63-28aa-4559-9642-28bd316379e3
3efd4a46-9a60-40db-93f7-8bc868898e4f	2025-07-28 17:00:26.629177	\N	1977	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Harvey Dent s Tragedy Thread Content Was Harvey s fall inevitable, or could Batman have saved him? Discussion Comments - He was Gotham s hope, truly. - Losing Rachel broke him beyond repair. - Batman couldn t save both. - Tragedy made him a villain. - Harvey s arc is Shakespearean.\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: The thread discusses the tragic downfall of Harvey Dent in the Batman universe, questioning whether his transformation into Two-Face was unavoidable. Participants debate whether Batman could have prevented Dent's descent into villainy, with many attributing his breakdown to Rachel Dawes' death and the inherent corruption of Gotham. Some suggest Batman was forced to choose between saving Rachel and Harvey, highlighting the no-win situation. The discussion emphasizes the tragic nature of Dent's character arc, comparing it to a Shakespearean tragedy.\n\nKEY_TOPICS: [Harvey Dent's Tragedy, Batman's Role, Rachel Dawes' Death, Inevitability vs. Choice, The Nature of Tragedy]	COMPLETED	2025-07-28 17:00:28.608331	8463cef9-1881-4af6-b745-ba4ba5501bf7
65fe6be5-6da5-47ef-b6cb-50962048b782	2025-07-28 14:51:06.429698	\N	1695	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Van der Linde Gang Rides Again Thread Content Reunite with fellow outlaws to share stories, screenshots, and shenanigans from Red Dead Redemption 2. Whether you're chasing bounties, exploring the frontier, or just causing chaos with the Van der Linde gang this is your hideout. Discussion Comments\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: The "Van der Linde Gang Rides Again" thread serves as a virtual gathering place for Red Dead Redemption 2 players to connect and share their experiences. Participants swap stories about their in-game adventures, post screenshots of memorable moments, and recount tales of causing mayhem in the open world. The thread fosters a sense of community among players who enjoy the game's diverse activities, from bounty hunting and exploration to embracing the outlaw lifestyle alongside the Van der Linde gang. It's a place to relive the Red Dead Redemption 2 experience and connect with like-minded individuals.\n\nKEY_TOPICS: [Story Sharing, Screenshots, Open-World Exploration, Van der Linde Gang, In-Game Shenanigans]	COMPLETED	2025-07-28 14:51:08.125617	9bcc847e-d566-4487-bb87-f790bf929a8e
2be0e197-9b92-4692-b4c2-2caaa76bf568	2025-07-28 14:58:17.201716	\N	3557	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title akash Thread Content pataal Discussion Comments\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: The thread "akash" discusses "pataal," likely referring to the Hindu underworld or a deep, metaphorical abyss. The limited context makes a precise summary difficult, but the discussion appears to involve exploring the concept of "pataal," possibly in a symbolic or philosophical sense. Without further context, it's unclear what specific aspects of "pataal" are being examined, but the discussion seems to center around its nature, implications, or potential interpretations.\n\nKEY_TOPICS: [pataal, underworld, abyss, symbolism, philosophy]	COMPLETED	2025-07-28 14:58:20.759276	a71e4601-e9bb-4fe8-9a2a-22ae5422c61b
b4790e44-82aa-4f22-9e70-a62b145ef3b0	2025-07-28 16:42:28.129068	\N	3637	Please create a detailed summary of the following thread content. Keep the summary to approximately 200 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title The Joker s Philosophy Thread Content Do you think Joker s chaos argument was valid in a world full of corruption? Discussion Comments - His argument was terrifyingly convincing. - The ferry dilemma still gives me chills. - He exposes the fragility of order. - I think he just wanted to prove a point, not win. - Chaos is fair Joker proved that.\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: This thread discusses the philosophical validity of the Joker's actions and arguments, particularly his advocacy for chaos, within the context of corruption. Participants find his arguments disturbingly persuasive, citing the ferry dilemma as a prime example of his chilling effectiveness. The Joker is seen as exposing the inherent fragility of societal order and the ease with which it can be disrupted. A key point raised is whether the Joker's aim was genuine belief in chaos or simply a desire to demonstrate its potential. The discussion concludes that the Joker, through his actions, successfully illustrated the perceived "fairness" of chaos as a counterpoint to corrupt order.\n\nKEY_TOPICS: [Joker's Philosophy, Chaos vs. Order, Corruption, The Ferry Dilemma, Joker's Motivation]	COMPLETED	2025-07-28 16:42:31.76621	7aee9976-8ff3-4484-a589-a3f39fb123ab
8de89415-4e3e-4d3d-909f-387ba80a3f10	2025-07-28 16:47:36.769984	\N	3229	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Atticus Finch Hero or Idealist? Thread Content Was Atticus realistic in expecting justice from the jury? Discussion Comments - He was the voice of conscience. - Idealist maybe, but necessary. - Reality rarely rewards such virtue. - He stood firm even when he lost. - True heroism doesn t need a win.\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: The thread debates whether Atticus Finch from *To Kill a Mockingbird* was a hero or simply an unrealistic idealist in his pursuit of justice. Commenters acknowledge his idealism but also recognize its necessity as a moral compass. The discussion highlights the conflict between Atticus's unwavering belief in justice and the harsh realities of prejudice. Despite losing the case, Atticus's steadfastness and commitment to his principles are seen as heroic, suggesting that true heroism lies in the fight itself, not necessarily the victory.\n\nKEY_TOPICS: [Atticus Finch, Idealism vs. Realism, Justice, Heroism, Moral Courage]	COMPLETED	2025-07-28 16:47:39.999599	349791b5-b936-47e1-9afc-e00a063a3a3e
bc6489b4-e82c-4346-be52-9c79accfe10e	2025-07-28 17:00:38.994918	\N	1813	Please create a brief summary of the following thread content. Keep the summary to approximately 100 words. Also identify 3-5 key topics discussed. Focus on the main points, key insights, and important discussions.\n\nContent to summarize:\nThread Title Harvey Dent s Tragedy Thread Content Was Harvey s fall inevitable, or could Batman have saved him? Discussion Comments - He was Gotham s hope, truly. - Losing Rachel broke him beyond repair. - Batman couldn t save both. - Tragedy made him a villain. - Harvey s arc is Shakespearean.\n\nPlease format your response as:\nSUMMARY: [your summary here]\nKEY_TOPICS: [topic1, topic2, topic3, etc.]	SUMMARY	SUMMARY: The thread discusses the tragic downfall of Harvey Dent in Batman lore, specifically questioning whether his transformation into Two-Face was inevitable or preventable by Batman. A key consensus seems to be that the loss of Rachel Dawes was a pivotal moment, shattering Dent's psyche and pushing him over the edge. The discussion suggests Batman was unable to prevent the tragedy, and that Dent's arc embodies a Shakespearean tragedy, highlighting the loss of a promising figure to villainy.\n\nKEY_TOPICS: [Harvey Dent's Fall, Batman's Role, Rachel Dawes' Death, Inevitability vs. Preventability, Tragedy]	COMPLETED	2025-07-28 17:00:40.810024	c4bd4954-c17d-4bbc-b3eb-a25114b2c2cd
\.


--
-- Data for Name: club_leave_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.club_leave_logs (id, left_at, reason, club_id, user_id) FROM stdin;
5b1f4f62-3297-4da1-a5ee-3c38f2e63aec	2025-07-28 01:23:47.24517		6f1243c1-f36d-4df2-9197-92cc0d26fb24	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
2ae35a3e-9057-4e9b-bbd5-e169aceb807f	2025-07-28 01:32:49.54741		6f1243c1-f36d-4df2-9197-92cc0d26fb24	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clubs (id, media_type_id, name, description, created_by, created_at, last_activity_at, last_thread_created_at, linked_media_id) FROM stdin;
cf688658-f4d9-4164-9843-46fa75a5efd0	550e8400-e29b-41d4-a716-446655440004	k	k	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	2025-07-27 18:10:29.180966	\N	\N	4635b5d0-5cfb-4b26-8749-44f8c2bea2a3
57e7af79-b324-4e3c-91af-5f5f92317e0e	550e8400-e29b-41d4-a716-446655440001	Sci-Fi Movie Club	Discussion club for science fiction movies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 13:40:27.681744	3c55deac-aa6d-4605-95f6-1c9676ff6e64
68787b29-734e-4b10-a4bf-401f1ae3e3b6	550e8400-e29b-41d4-a716-446655440001	Sci-Fi Movie Club	Discussion club for science fiction movies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 13:42:38.040383	3c55deac-aa6d-4605-95f6-1c9676ff6e64
5e5fe910-bd7c-464d-957f-fbcfadd72854	550e8400-e29b-41d4-a716-446655440002	Sci-Fi TV Series Club	Discussion club for science fiction tv seriess	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	\N	6d95c39a-66fb-487f-b301-0faf51ebc87e
1153d21a-30da-4240-878c-9bbf2bc268e0	550e8400-e29b-41d4-a716-446655440003	Sci-Fi Book Club	Discussion club for science fiction books	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-07-07 10:03:51.973489	2025-07-07 10:03:51.973489	c03f7e7d-554d-4f0a-8e2a-e4341ff5b538
aa88ed56-9e54-4aa3-b33b-b16e1da02e8c	550e8400-e29b-41d4-a716-446655440003	asfiaj asjd	askdjsdj oowe	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 15:41:11.665434	\N	\N	c03f7e7d-554d-4f0a-8e2a-e4341ff5b538
ddc02c3d-d7c6-43c9-81b2-a2d603c5bc4c	550e8400-e29b-41d4-a716-446655440003	ajhxjhas	dvjkakjc	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 16:24:54.283328	\N	\N	c03f7e7d-554d-4f0a-8e2a-e4341ff5b538
e7182d74-efb3-4427-bf94-4dc6a769c5e5	550e8400-e29b-41d4-a716-446655440003	asfjash iasohdoiase	asjeoiwr oieurinvnvm	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 16:20:26.866912	2025-07-26 21:50:32.419836	2025-07-26 21:50:32.419836	c03f7e7d-554d-4f0a-8e2a-e4341ff5b538
452c7a0d-2eae-421d-9696-92e7f131254b	550e8400-e29b-41d4-a716-446655440003	Sci-Fi Book Club	Discussion club for science fiction books	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-06-30 08:55:44.46577	2025-07-04 15:36:07.213565	2025-07-04 15:36:07.213565	c03f7e7d-554d-4f0a-8e2a-e4341ff5b538
df50b126-de42-412e-9ee0-4d5f2b2412ee	550e8400-e29b-41d4-a716-446655440004	Studio Ghibli Appreciation Society	Dedicated to discussing and analyzing Studio Ghibli films	3281e9dd-b913-4d48-836f-0b5539d89999	2025-06-30 08:55:44.46577	2025-06-30 08:55:44.46577	2025-07-04 14:57:51.432997	dfa8bc3e-418b-4f7e-bd76-6ba05ea06fe7
8825011e-38ce-48da-b6e5-2fad2b44df69	550e8400-e29b-41d4-a716-446655440004	sample_value_club	adjfajfha afuihfkja	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	2025-07-14 16:17:48.102352	2025-07-27 13:36:58.406687	2025-07-27 13:36:58.406687	dfa8bc3e-418b-4f7e-bd76-6ba05ea06fe7
0c167685-5bed-45be-aa67-3d682f5f62b6	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	a b c	def	a688cb56-0dca-466b-840f-e277a3d1431d	2025-06-30 09:08:48.269639	2025-07-12 19:27:31.2851	2025-07-12 19:27:31.2851	ba617ef5-c70b-4cf5-936d-a9367e70c091
8612a07b-91fc-4177-b326-765af2aa76ad	1e1756e6-549e-4db9-a974-e05e9c9181fb	Sumon	baal create	a688cb56-0dca-466b-840f-e277a3d1431d	2025-07-02 09:54:50.097023	2025-07-04 16:08:34.43969	2025-07-04 16:08:34.43969	e64bf60e-2ce3-46e3-b206-1429e6596ca2
d5e6a602-a4cc-4cb2-aedd-d94e6173f9fa	550e8400-e29b-41d4-a716-446655440001	Shawshank Redemption Society	For fans of hope and redemption stories	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	4f3b51c1-5db7-4d8d-9597-6f9804e13227
ff195285-79b2-4d55-8f16-738afb4ba87d	550e8400-e29b-41d4-a716-446655440001	Corleone Family Appreciation Club	Discussing the greatest crime saga ever told	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	305d5a2b-955c-453f-ab2f-851e148cb3e9
0953119e-2717-4151-a1de-36868a2ba129	550e8400-e29b-41d4-a716-446655440001	Dark Knight Devotees	Why so serious? Batman and Joker analysis group	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	8a7d2c92-b541-4aa2-be90-edb9b20d4c3b
6760eb2a-3c0a-4465-bc0a-83bd497154cc	550e8400-e29b-41d4-a716-446655440001	Pulp Fiction Philosophy Club	Exploring Tarantino dialogue and storytelling	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	b39fb100-db78-4348-b063-01330a990ac8
cc7caab4-eb5b-44da-85d0-3733c57c0d8d	550e8400-e29b-41d4-a716-446655440001	Life is Like a Box of Chocolates	Forrest Gump life lessons and memorable quotes	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	fa80ba20-8153-4360-9972-ebbc9e21b18d
933a3769-4568-447b-8795-1e6f02334686	550e8400-e29b-41d4-a716-446655440001	Dream Within a Dream Society	Inception theories and mind-bending discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	3c55deac-aa6d-4605-95f6-1c9676ff6e64
b1deb005-cb6b-467d-a88a-15dae24e22d3	550e8400-e29b-41d4-a716-446655440001	Red Pill Blue Pill Collective	Matrix philosophy and simulation theory discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	b72f2c70-32ba-4727-b091-484cc795d125
30b44282-4689-44aa-911a-8390716c214a	550e8400-e29b-41d4-a716-446655440001	Wiseguy Watchers	Analyzing the rise and fall in Goodfellas	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	8def709d-14e7-427b-bbc2-44d9618a1263
d0336277-679e-4ec7-9aa8-13155b1a409d	550e8400-e29b-41d4-a716-446655440001	Schindlers List Memorial Group	Remembering history through powerful cinema	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	\N
37299ab6-3906-47be-a5be-f410ee74be2c	550e8400-e29b-41d4-a716-446655440001	Interstellar Space Explorers	Love transcends dimensions discussion group	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.031717	\N	\N	510ecbf2-03c2-4cf1-acd4-6815c731b2f9
130e1747-1118-40f1-bf31-b9b7029115bb	550e8400-e29b-41d4-a716-446655440002	Heisenberg Chemistry Club	Breaking Bad analysis and character studies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	7cfd3e8d-047b-46e9-9a04-081fe4ff82a2
662ca892-a34a-4a4d-9788-3ce57c618c13	550e8400-e29b-41d4-a716-446655440002	Iron Throne Contenders	Game of Thrones theories and house discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	9c4288a7-f6b3-4eda-a6a3-ecdf712c9b5e
48b7ab28-2a3c-44ae-942f-fb83bc45e4b0	550e8400-e29b-41d4-a716-446655440002	Bada Bing Regulars	The Sopranos mob psychology discussion group	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	cacbbb6a-d3d3-40bf-a357-98fcf8c7ccc1
0aa40b04-6dbd-4300-a75f-d96311f78ed0	550e8400-e29b-41d4-a716-446655440002	Upside Down Investigators	Stranger Things mysteries and 80s nostalgia	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	bceb0ec2-d2b4-4c6b-8450-de224de38ab5
901da6e4-8486-402f-92fc-1f79481ae2f1	550e8400-e29b-41d4-a716-446655440002	Baltimore Streets Society	The Wire urban drama and social commentary	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	0df02a6c-2e9c-400c-b773-02314556d998
04a04f1b-a63e-4813-9c0a-fe40cac6e583	550e8400-e29b-41d4-a716-446655440002	Central Perk Coffee Club	Friends episodes and NYC friendship goals	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	855ad91b-55d7-473d-a1e3-bb76eabc1752
a88db7e7-a965-4dfd-b871-a76e04ad8fe3	550e8400-e29b-41d4-a716-446655440002	Dunder Mifflin Employee Union	The Office humor and workplace comedy analysis	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	6d95c39a-66fb-487f-b301-0faf51ebc87e
d8efa731-3218-4d84-9fa4-89cc97a78658	550e8400-e29b-41d4-a716-446655440002	Island Mystery Solvers	Lost theories and DHARMA Initiative discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	f37da241-d862-471f-8ce6-9034e7a67979
1cc42ec0-a342-4768-8883-47fd62e8e1b4	550e8400-e29b-41d4-a716-446655440002	Royal Protocol Society	The Crown historical drama and British monarchy	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	a05086b6-1b65-4699-b89f-04a0bc105836
c37b80dc-c549-42b2-a8c7-31a712faaddd	550e8400-e29b-41d4-a716-446655440002	221B Baker Street Society	Sherlock modern detective work appreciation	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.039719	\N	\N	8a54a8ec-b796-40f0-8536-208727daf6b1
17adfa53-9e99-42ab-a40e-7ca15541eb68	550e8400-e29b-41d4-a716-446655440003	Mockingbird Justice League	To Kill a Mockingbird social justice discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	e3eaf289-714d-4441-b032-243f1f269530
84880690-a8dd-4035-9536-998e0b19259f	550e8400-e29b-41d4-a716-446655440003	Big Brother Watchers	1984 dystopian reality and surveillance society	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	01e3c9a1-1263-4a4d-9ed8-8034662f8a05
0dc9faf6-9f76-459a-bc24-f5e37101749a	550e8400-e29b-41d4-a716-446655440003	Pemberley Estate Society	Pride and Prejudice romance and social commentary	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	bcf3b041-f96d-47f8-9630-acf386387e4a
685d633b-6626-4fc6-aa0d-cb78f52f8b90	550e8400-e29b-41d4-a716-446655440003	Green Light Chasers	The Great Gatsby American Dream analysis	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	7b54e798-ea6d-44ec-8162-aefb4f6c6dbf
d9036940-9066-4e85-834a-cb7bc93c653f	550e8400-e29b-41d4-a716-446655440003	Fellowship of the Ring	Lord of the Rings epic fantasy discussion group	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	6035f92e-f4fc-49ff-bca1-88e69e8f6f24
c0a0cd49-1840-4fe1-86f3-b625d0ead682	550e8400-e29b-41d4-a716-446655440003	Hogwarts Alumni Association	Harry Potter magical world exploration	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	\N
8ff837bd-e4c6-4c99-ae4e-5f6bb7fe99ee	550e8400-e29b-41d4-a716-446655440003	Holden Caulfield Understanders	Catcher in the Rye coming-of-age discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	c03f7e7d-554d-4f0a-8e2a-e4341ff5b538
a5ba369e-bf78-4497-a4d0-8fea4cb15d38	550e8400-e29b-41d4-a716-446655440003	Arrakis Desert Wanderers	Dune political intrigue and spice must flow	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	611ce9df-f501-4768-957b-cc75baf25062
de0765c6-63b6-47b2-8da6-7e3ba2958e5d	550e8400-e29b-41d4-a716-446655440003	Bag End Book Club	The Hobbit adventure and tolkien mythology	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	016ce177-ce3f-4735-a753-4bfdd213fa3c
658d42e3-e277-40f2-8741-7204ff280995	550e8400-e29b-41d4-a716-446655440003	Soma Distribution Society	Brave New World dystopian technology discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.041079	\N	\N	c75d8cd1-78bd-445b-9c80-ab6c0ca6daeb
83bbdd02-bebb-4965-98c2-b492f11382be	550e8400-e29b-41d4-a716-446655440004	Spirit World Travelers	Spirited Away magical world appreciation society	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	2528be09-e8c8-456d-ae61-5292986ec782
c4343a49-f0be-45a2-b790-ed798c99e8e9	550e8400-e29b-41d4-a716-446655440004	Body Swap Chronicles	Your Name time-bending romance discussion	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	4635b5d0-5cfb-4b26-8749-44f8c2bea2a3
1a82048b-bec5-4fb8-b792-73722f513b9e	550e8400-e29b-41d4-a716-446655440004	Forest Spirit Guardians	Princess Mononoke environmental activism group	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	043e5f3f-ceb1-4ce0-8aee-21fa7418d6c7
c5f0e194-a2ed-4a70-8220-30706f106777	550e8400-e29b-41d4-a716-446655440004	Neo-Tokyo Motorcycle Club	Akira cyberpunk and psychic powers analysis	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	30943df5-db45-45aa-bdc4-f9e9e843019e
2897aad9-6672-4f41-9615-240e7f39b7f9	550e8400-e29b-41d4-a716-446655440004	Plus Ultra Hero Society	My Hero Academia superhero training discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	dfa8bc3e-418b-4f7e-bd76-6ba05ea06fe7
8f71b245-7eae-43ab-b1b9-f4e1ab4b955e	550e8400-e29b-41d4-a716-446655440004	Demon Slaying Corps	Demon Slayer breathing techniques and sword arts	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	a06853ad-5702-43a2-ba4f-76cf0b01a178
a4b5682c-63ef-4ad5-ae97-d55c663271ed	550e8400-e29b-41d4-a716-446655440004	Flying Castle Explorers	Castle in the Sky adventure and steampunk lovers	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	d693f2cc-b0de-4baa-9cef-e3606e9086d8
f98ed559-2037-4a20-a26c-f0c02e84a419	550e8400-e29b-41d4-a716-446655440004	Section 9 Cyber Investigators	Ghost in the Shell philosophy and cybernetics	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	0c294409-0e80-4089-a768-bcdabaa3df75
4de0ee6e-48ad-4af4-9ba5-c697b4cb5d3a	550e8400-e29b-41d4-a716-446655440004	Weather Manipulation Society	Weathering with You climate and supernatural romance	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	a8679b36-a7aa-4578-a466-9986b6575eec
f86941aa-d530-4da5-9fb8-4cc3ac90b8af	550e8400-e29b-41d4-a716-446655440004	Survey Corps Veterans	Attack on Titan freedom fighters and titan studies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.04214	\N	\N	c0e16ffa-919f-4a02-b2a0-33801f66897c
046d06c1-350a-44cd-b12e-3e8f298c11a0	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Straw Hat Pirates Crew	One Piece adventure and nakama friendship	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	01fbdf11-6ddd-42be-94cc-9a1091283e9b
ac17c84e-d793-48d0-b66b-5de8aa43765e	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Hidden Leaf Village Alumni	Naruto ninja way and shinobi philosophy	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	dd32223e-956b-49de-b86d-c251ed6f77fb
b37b8d3d-ac52-44f4-8dfe-bf80df4a9113	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Dragon Ball Collectors Society	Dragon Ball martial arts and power scaling debates	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	481c4f92-496b-4b7b-a3a8-a42f912d49c8
d793c845-5097-4a93-a542-59541279b498	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Wall Maria Defenders	Attack on Titan manga analysis and theories	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	f504e8c7-ad5c-4370-8835-d44ed545344e
471d28fc-286c-44c1-b804-950f51d8f93d	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Death Note Investigators	Death Note justice vs evil moral discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	9450fe52-2639-40c1-9aca-49ac33b523fc
03c8de71-72c7-4539-9e4b-5776c743f6db	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	UA High School Support Group	My Hero Academia manga readers and quirk analysis	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	16ad7a0f-d9e8-4d1d-920c-95676dd85ec9
26e3178e-820d-47ba-abd1-83aaaa1062a5	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Hero Association Rank C	One Punch Man overpowered hero comedy appreciation	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	97605df5-4af1-4efa-9dbb-a97b81055313
9832e9de-91de-4890-8b63-f4007b1f0840	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Tanjiro Training Dojo	Demon Slayer manga breathing and sword techniques	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	ba617ef5-c70b-4cf5-936d-a9367e70c091
42801eee-b7aa-4699-8385-955c0ad4c821	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Elric Brothers Alchemy Club	Fullmetal Alchemist equivalent exchange philosophy	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	69a8409a-c17d-490d-994f-a038742745c5
1e3bc0ad-1bb2-49ac-85c0-ddbbf0fd64d0	e28305d9-577c-4fd3-a4d0-636bcd18cd1c	Tokyo Jujutsu High Society	Jujutsu Kaisen cursed energy and sorcery studies	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.043358	\N	\N	79fe79f2-d1e5-4b70-b842-3c910fa35583
f235d169-c1e4-41cb-bc8b-89c6d2dae297	1e1756e6-549e-4db9-a974-e05e9c9181fb	Hyrule Exploration Society	Breath of the Wild open world adventure club	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	430c29e7-090d-46b0-b337-861b82bbb06c
8d94cf00-7b66-4085-9eef-bc12b1b2fb62	1e1756e6-549e-4db9-a974-e05e9c9181fb	School of the Wolf	Witcher 3 monster hunting and RPG discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	d007a33e-2d18-4bd2-96f9-b72f9a055f27
ddb005a5-8cb6-4217-859f-2fbb8a8b9486	1e1756e6-549e-4db9-a974-e05e9c9181fb	Spartan Warriors Brotherhood	God of War Norse mythology and father-son bonds	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	98623796-96e6-4cf1-934d-7bfb08a5cf2a
9ef1f727-ded1-4411-b522-f36d242dcc9f	1e1756e6-549e-4db9-a974-e05e9c9181fb	Mushroom Kingdom Citizens	Super Mario Odyssey platforming and kingdom exploring	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	e64bf60e-2ce3-46e3-b206-1429e6596ca2
c2a595d2-720d-4847-af6d-822cce14f2a3	1e1756e6-549e-4db9-a974-e05e9c9181fb	Night City Netrunners	Cyberpunk 2077 dystopian future and tech discussions	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	0a6d071c-dcea-4c6a-8c18-f3601cb03a1f
660fe52e-4ce1-4346-a10e-b19ba7d85596	1e1756e6-549e-4db9-a974-e05e9c9181fb	Firefly Survivors United	Last of Us Part II post-apocalyptic survival stories	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	35904f43-8b64-450a-8208-b274ce800324
22c5a0b0-910e-493a-b863-4a3b1854e0b7	1e1756e6-549e-4db9-a974-e05e9c9181fb	Block Building Architects	Minecraft creative building and redstone engineering	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	ca44bcb9-1a69-4841-889e-e51bf623b47c
7e5cbc01-a609-42c9-ab18-95d741d966c1	1e1756e6-549e-4db9-a974-e05e9c9181fb	Los Santos Crime Family	Grand Theft Auto V heists and open world chaos	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	54093060-67a3-4128-abeb-cccf7feb511a
2b806e51-7c5f-4b49-8f5b-65f367c1ff35	1e1756e6-549e-4db9-a974-e05e9c9181fb	Tarnished Lords Society	Elden Ring souls-like challenge and lore exploration	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	\N	\N	1a02259a-fc84-43ef-930e-6043151a40e9
6f1243c1-f36d-4df2-9197-92cc0d26fb24	550e8400-e29b-41d4-a716-446655440003	dhuruClub	dhdhsdhfhso hlksvjsspokk;r 	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	2025-07-28 00:36:38.002286	\N	\N	01e3c9a1-1263-4a4d-9ed8-8034662f8a05
1c24d232-6fa1-4d74-a3b0-f78f642f1223	1e1756e6-549e-4db9-a974-e05e9c9181fb	Van der Linde Gang Reunion	Red Dead Redemption 2 wild west adventures	0b7c0688-b9bb-42ad-ab00-de26606283fa	2025-07-27 16:33:31.044648	2025-07-28 08:11:10.510877	2025-07-28 08:11:10.510877	5ee2ddf4-b326-4b8f-9ddd-687b6b70739b
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
cb2809b4-0b74-45ab-8a25-d3b5ccc7cf27	c1a1d541-1234-44cd-a5dd-111111111001	0b7c0688-b9bb-42ad-ab00-de26606283fa	His argument was terrifyingly convincing.	\N	2025-07-28 16:41:38.083908	\N	2
e5d6c485-fb98-46c6-8a9e-5b00e05c011a	c1a1d541-1234-44cd-a5dd-111111111001	0b7c0688-b9bb-42ad-ab00-de26606283fa	The ferry dilemma still gives me chills.	\N	2025-07-28 16:41:38.083908	\N	3
e357a2c2-9a3b-4475-90f1-8cfbdbdc23b3	c1a1d541-1234-44cd-a5dd-111111111001	0b7c0688-b9bb-42ad-ab00-de26606283fa	He exposes the fragility of order.	\N	2025-07-28 16:41:38.083908	\N	1
40c8e8f7-13c3-4432-aed1-624c13059505	c1a1d541-1234-44cd-a5dd-111111111001	0b7c0688-b9bb-42ad-ab00-de26606283fa	I think he just wanted to prove a point, not win.	\N	2025-07-28 16:41:38.083908	\N	0
7e338f85-0cb5-4226-a453-ec9b62c0763f	c1a1d541-1234-44cd-a5dd-111111111001	0b7c0688-b9bb-42ad-ab00-de26606283fa	Chaos is fair — Joker proved that.	\N	2025-07-28 16:41:38.083908	\N	4
385b0514-45d8-483e-a1f9-3504ba321805	c1a1d541-1234-44cd-a5dd-111111111002	0b7c0688-b9bb-42ad-ab00-de26606283fa	He was Gotham’s hope, truly.	\N	2025-07-28 16:41:38.091351	\N	2
dd09f937-6d78-4ad1-988c-198658a79914	c1a1d541-1234-44cd-a5dd-111111111002	0b7c0688-b9bb-42ad-ab00-de26606283fa	Losing Rachel broke him beyond repair.	\N	2025-07-28 16:41:38.091351	\N	3
4faab3ba-0410-4b0d-8724-5f6a8fa97a2a	c1a1d541-1234-44cd-a5dd-111111111002	0b7c0688-b9bb-42ad-ab00-de26606283fa	Batman couldn’t save both.	\N	2025-07-28 16:41:38.091351	\N	1
1a2419c6-7b2b-4ac4-896d-66e45304e565	c1a1d541-1234-44cd-a5dd-111111111002	0b7c0688-b9bb-42ad-ab00-de26606283fa	Tragedy made him a villain.	\N	2025-07-28 16:41:38.091351	\N	0
830aad30-5ca4-44fd-bf0b-72f9de488f47	c1a1d541-1234-44cd-a5dd-111111111002	0b7c0688-b9bb-42ad-ab00-de26606283fa	Harvey’s arc is Shakespearean.	\N	2025-07-28 16:41:38.091351	\N	2
176722e8-0916-4918-9b24-8d5852662cbb	c1a1d541-1234-44cd-a5dd-111111111003	0b7c0688-b9bb-42ad-ab00-de26606283fa	Interrogation room with Joker. Pure brilliance.	\N	2025-07-28 16:41:38.092275	\N	5
d7110350-d63d-44e9-b282-2dbf19293de9	c1a1d541-1234-44cd-a5dd-111111111003	0b7c0688-b9bb-42ad-ab00-de26606283fa	The truck flip was legendary.	\N	2025-07-28 16:41:38.092275	\N	4
573ea845-43cb-4010-b310-67724438343a	c1a1d541-1234-44cd-a5dd-111111111003	0b7c0688-b9bb-42ad-ab00-de26606283fa	Joker sliding down the pile of money 🔥	\N	2025-07-28 16:41:38.092275	\N	3
cf631ca7-6a04-4ec6-bbb5-ff27da6175f5	c1a1d541-1234-44cd-a5dd-111111111003	0b7c0688-b9bb-42ad-ab00-de26606283fa	Opening bank heist still unmatched.	\N	2025-07-28 16:41:38.092275	\N	5
606df3cd-f2fd-4dee-97c2-cdd7548384b6	c1a1d541-1234-44cd-a5dd-111111111003	0b7c0688-b9bb-42ad-ab00-de26606283fa	Final monologue by Batman hits deep.	\N	2025-07-28 16:41:38.092275	\N	3
95f81521-65a2-4865-8eed-d9bfaee8a35d	c2b2d541-1234-44cd-a5dd-111111112001	0b7c0688-b9bb-42ad-ab00-de26606283fa	He was the voice of conscience.	\N	2025-07-28 16:46:49.317154	\N	2
7568f210-ad46-454a-9ee5-e4f4d9857bc7	c2b2d541-1234-44cd-a5dd-111111112001	0b7c0688-b9bb-42ad-ab00-de26606283fa	Idealist maybe, but necessary.	\N	2025-07-28 16:46:49.317154	\N	2
eaaec680-343e-4e14-b20a-19f260d7c13e	c2b2d541-1234-44cd-a5dd-111111112001	0b7c0688-b9bb-42ad-ab00-de26606283fa	Reality rarely rewards such virtue.	\N	2025-07-28 16:46:49.317154	\N	2
a261a129-6560-491f-85cb-c6607f22a855	c2b2d541-1234-44cd-a5dd-111111112001	0b7c0688-b9bb-42ad-ab00-de26606283fa	He stood firm even when he lost.	\N	2025-07-28 16:46:49.317154	\N	2
7d748abd-f07b-43a0-a248-907771aca468	c2b2d541-1234-44cd-a5dd-111111112001	0b7c0688-b9bb-42ad-ab00-de26606283fa	True heroism doesn’t need a win.	\N	2025-07-28 16:46:49.317154	\N	2
89e12bea-3311-4dcb-99a4-0696a483e735	c3c3d541-1234-44cd-a5dd-111111113001	0b7c0688-b9bb-42ad-ab00-de26606283fa	No-Face shows the emptiness of consumption.	\N	2025-07-28 16:46:49.318076	\N	2
e43b01ff-de79-491c-97be-34dba0f59722	c3c3d541-1234-44cd-a5dd-111111113001	0b7c0688-b9bb-42ad-ab00-de26606283fa	He absorbs the chaos around him.	\N	2025-07-28 16:46:49.318076	\N	2
df04fda9-9f0c-473b-9430-668bf61e4786	c3c3d541-1234-44cd-a5dd-111111113001	0b7c0688-b9bb-42ad-ab00-de26606283fa	A child’s imagination can birth spirits like him.	\N	2025-07-28 16:46:49.318076	\N	2
fe24ddac-b1d7-4f6a-ad23-55e82ad67191	c3c3d541-1234-44cd-a5dd-111111113001	0b7c0688-b9bb-42ad-ab00-de26606283fa	In a way, he reflects loneliness.	\N	2025-07-28 16:46:49.318076	\N	2
e9407107-a3f5-45f5-b922-ce8ee610937c	c3c3d541-1234-44cd-a5dd-111111113001	0b7c0688-b9bb-42ad-ab00-de26606283fa	Pure spirit until corrupted by greed.	\N	2025-07-28 16:46:49.318076	\N	2
1e3a0f4b-c7e5-4871-b71e-850a92274f46	c8c7204d-d57e-4494-8def-244660d55447	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	abc\n	\N	2025-07-28 16:56:47.703694	\N	0
\.


--
-- Data for Name: event_interests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_interests (id, created_at, event_id, user_id) FROM stdin;
14d5772f-9537-41cc-aecc-1e33698f1996	2025-07-27 18:12:40.796505	d799f8fe-ade6-4422-8c59-d8c21841cea5	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2
af3fa43b-36da-4caa-8a9d-cc7dd7bb6791	2025-07-27 18:19:16.488609	d799f8fe-ade6-4422-8c59-d8c21841cea5	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986
4eb1a096-8911-4bcf-86e2-5533a4db5503	2025-07-28 16:40:17.734386	e1a1d541-1234-44cd-a5dd-211111111001	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
95903847-98ae-46ec-8d8b-ce74ded20d9c	2025-07-28 16:58:59.684742	d799f8fe-ade6-4422-8c59-d8c21841cea5	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, club_id, created_by, title, description, event_date, location, max_participants, current_participants, created_at, updated_at) FROM stdin;
d799f8fe-ade6-4422-8c59-d8c21841cea5	cf688658-f4d9-4164-9843-46fa75a5efd0	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	nothing	moja	2025-07-31 12:16:00	Dhaka	10	0	2025-07-27 18:11:51.270964	\N
e1a1d541-1234-44cd-a5dd-211111111001	0953119e-2717-4151-a1de-36868a2ba129	0b7c0688-b9bb-42ad-ab00-de26606283fa	Dark Knight Rewatch Night	A group rewatch with live commentary on Joker’s choices.	2025-08-04 16:38:59.096125	Gotham Cafe	30	0	2025-07-28 16:38:59.096125	\N
e1a1d541-1234-44cd-a5dd-211111111002	0953119e-2717-4151-a1de-36868a2ba129	0b7c0688-b9bb-42ad-ab00-de26606283fa	Two-Face Justice Panel	Discuss moral decay and Harvey Dent’s story arc.	2025-08-11 16:38:59.096125	Wayne Hall	20	0	2025-07-28 16:38:59.096125	\N
e1a1d541-1234-44cd-a5dd-211111111003	0953119e-2717-4151-a1de-36868a2ba129	0b7c0688-b9bb-42ad-ab00-de26606283fa	Why So Serious? Costume Day	Dress up as your favorite Gotham character.	2025-08-18 16:38:59.096125	Arkham Grounds	50	0	2025-07-28 16:38:59.096125	\N
e2b2d541-1234-44cd-a5dd-211111112001	17adfa53-9e99-42ab-a40e-7ca15541eb68	0b7c0688-b9bb-42ad-ab00-de26606283fa	Mockingbird Film Night	Watch and discuss the film adaptation of To Kill a Mockingbird.	2025-08-02 16:43:42.780264	Old Town Theater	25	0	2025-07-28 16:43:42.780264	\N
e2b2d541-1234-44cd-a5dd-211111112002	17adfa53-9e99-42ab-a40e-7ca15541eb68	0b7c0688-b9bb-42ad-ab00-de26606283fa	Moral Courage Workshop	A discussion workshop on ethics and bravery.	2025-08-09 16:43:42.780264	Library Hall	15	0	2025-07-28 16:43:42.780264	\N
e2b2d541-1234-44cd-a5dd-211111112003	17adfa53-9e99-42ab-a40e-7ca15541eb68	0b7c0688-b9bb-42ad-ab00-de26606283fa	Scout’s Diary Read-Along	Experience the story from a child’s point of view.	2025-08-17 16:43:42.780264	Zoom	100	0	2025-07-28 16:43:42.780264	\N
e3c3d541-1234-44cd-a5dd-211111113001	83bbdd02-bebb-4965-98c2-b492f11382be	0b7c0688-b9bb-42ad-ab00-de26606283fa	Spirited Screening	Watch Spirited Away with commentary and trivia.	2025-08-02 16:46:49.315033	Main Hall	30	0	2025-07-28 16:46:49.315033	\N
e3c3d541-1234-44cd-a5dd-211111113002	83bbdd02-bebb-4965-98c2-b492f11382be	0b7c0688-b9bb-42ad-ab00-de26606283fa	Anime Philosophy Talk	Discuss themes of identity and freedom in Studio Ghibli films.	2025-08-02 16:46:49.315709	Main Hall	30	0	2025-07-28 16:46:49.315709	\N
e3c3d541-1234-44cd-a5dd-211111113003	83bbdd02-bebb-4965-98c2-b492f11382be	0b7c0688-b9bb-42ad-ab00-de26606283fa	Miyazaki Masterclass	Learn storytelling through visual metaphors.	2025-08-02 16:46:49.31654	Main Hall	30	0	2025-07-28 16:46:49.31654	\N
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
36282101-3f91-4b43-b12d-361a44b71205	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	Event Interest	null null is interested in your event	EVENT_INTEREST	f	d799f8fe-ade6-4422-8c59-d8c21841cea5	EVENT	2025-07-27 18:12:40.808619	\N
6adb31c6-0c84-42d6-acf2-67b98c8d8b82	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	New club member	dhuru joined k	club_join	f	cf688658-f4d9-4164-9843-46fa75a5efd0	club	2025-07-27 18:19:04.873408	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986
4f3da6e7-590c-40cf-8a66-07d6ae65d4cb	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	Event Interest	null null and null null are interested in your event	EVENT_INTEREST	f	d799f8fe-ade6-4422-8c59-d8c21841cea5	EVENT	2025-07-27 18:19:16.498984	\N
688c559d-8d1d-4f71-a80c-020f0c030db8	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	New club member	abdullah991r joined k	club_join	f	cf688658-f4d9-4164-9843-46fa75a5efd0	club	2025-07-28 00:15:46.625736	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
61de1117-b738-4725-9fe3-fef75d3305f8	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	New club member	abdullah991r joined k	club_join	f	cf688658-f4d9-4164-9843-46fa75a5efd0	club	2025-07-28 00:15:46.639179	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
5c346d1c-a485-43de-ad18-785dcae177de	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	Event Interest	Abdullah Faiyaz, null null and null null are interested in your event	EVENT_INTEREST	f	d799f8fe-ade6-4422-8c59-d8c21841cea5	EVENT	2025-07-28 00:16:19.979572	\N
bb69bc98-fbe8-4f57-9c0f-26aba718175e	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	New club member	abdullah991r joined dhuruClub	club_join	f	6f1243c1-f36d-4df2-9197-92cc0d26fb24	club	2025-07-28 00:44:18.921259	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
7abcf319-aee8-4acb-b013-01b08b6bdbdc	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	Member left club	abdullah991r left dhuruClub	club_leave	f	6f1243c1-f36d-4df2-9197-92cc0d26fb24	club	2025-07-28 01:23:47.265399	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
e05d1f13-70f3-4384-964a-6fc9e4e894f7	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	New club member	abdullah991r joined dhuruClub	club_join	f	6f1243c1-f36d-4df2-9197-92cc0d26fb24	club	2025-07-28 01:24:03.322577	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
871ee0e2-1f35-41e3-b0d7-3c8d552d24d4	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	Member left club	abdullah991r left dhuruClub	club_leave	f	6f1243c1-f36d-4df2-9197-92cc0d26fb24	club	2025-07-28 01:32:49.559929	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
efad3cb7-4f25-43ce-8697-64b49c477d6e	ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	New club member	abdullah991r joined dhuruClub	club_join	f	6f1243c1-f36d-4df2-9197-92cc0d26fb24	club	2025-07-28 01:33:18.515043	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
2377a4ab-6001-4c5c-9198-5ca0bc687673	0b7c0688-b9bb-42ad-ab00-de26606283fa	Event Interest	Abdullah Faiyaz is interested in your event	EVENT_INTEREST	f	e1a1d541-1234-44cd-a5dd-211111111001	EVENT	2025-07-28 16:40:17.753918	\N
eacbd867-54e2-4f50-8f05-1bcc17aecf9a	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	Event Interest	Abdullah Faiyaz, null null and null null are interested in your event	EVENT_INTEREST	f	d799f8fe-ade6-4422-8c59-d8c21841cea5	EVENT	2025-07-28 16:58:59.703257	\N
\.


--
-- Data for Name: quiz_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_sessions (id, user_id, media_id, club_id, questions, user_answers, score, total_questions, difficulty_level, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: thread_dislikes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thread_dislikes (id, created_at, thread_id, user_id) FROM stdin;
f1dc118e-6622-436a-be1e-db48b3cc6cad	2025-07-05 20:23:21.574131	fd43fa7a-a60b-4349-bc41-533580643fc0	11cfd680-2c4c-43fd-aed0-7ba80604f411
96eca8f6-d690-4d3a-b28f-d53c308a659b	2025-07-28 16:56:52.117544	c8c7204d-d57e-4494-8def-244660d55447	66b1d6f4-70cf-4bcb-a038-fe570b979dd8
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
0d39c01b-8341-4dc0-aedd-8c8dcb3b9bf3	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	hgf	asd	5	0	f	f	2025-07-04 13:43:42.811431	\N	0	0	2025-07-28 15:51:19.522131
e226e86d-759c-4dd5-9a6e-093865d9a8c2	1153d21a-30da-4240-878c-9bbf2bc268e0	4a754586-c9bd-4c47-8599-a9f34e309464	Sir	Is good boy	28	2	f	f	2025-07-07 10:03:51.68429	\N	1	0	2025-07-28 15:51:16.1519
c2b2d541-1234-44cd-a5dd-111111112002	17adfa53-9e99-42ab-a40e-7ca15541eb68	0b7c0688-b9bb-42ad-ab00-de26606283fa	Boo Radley’s Symbolism	What does Boo Radley represent in our world today?	70	0	f	f	2025-07-28 16:43:42.773635	\N	0	0	\N
c119bf7e-6f39-450c-835e-ce752b862e41	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	akash	pataal	11	0	f	f	2025-07-04 13:39:29.861977	\N	0	0	2025-07-28 15:51:14.349532
798a84a8-5136-4241-aca9-af73e13d93ee	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	k	j	10	0	f	f	2025-07-04 13:40:27.681744	\N	0	0	2025-07-28 15:51:15.193188
37839c26-ae93-409e-8dc0-c63910b9eb04	e7182d74-efb3-4427-bf94-4dc6a769c5e5	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	about baal	sjgoisdh odbvuibgilbsd bscnxl nskfjaij jahcj	24	2	f	f	2025-07-26 21:49:05.553985	\N	1	0	2025-07-28 15:51:15.281191
f7d27d01-9de4-43cf-aca4-608caa7b5327	0c167685-5bed-45be-aa67-3d682f5f62b6	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	asdff	qerw	16	1	f	f	2025-07-12 19:27:31.269102	\N	0	0	2025-07-28 15:51:15.281617
d6f3608f-3e95-4b9d-ac07-c17f34556e24	8825011e-38ce-48da-b6e5-2fad2b44df69	a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	ekta sample thread	ekta sample thread khullam tomar jonno	42	0	f	f	2025-07-27 13:36:58.36702	\N	0	0	2025-07-28 15:51:15.585956
1265a499-aada-4da1-8455-f1b07b60db43	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	akash	pataal	17	0	f	f	2025-07-04 13:39:41.491691	\N	0	0	2025-07-28 16:56:22.538527
1c1573d0-e2d1-42ce-b49f-9b3a83616f66	452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d	rayan	boss	3	0	f	f	2025-07-04 15:35:33.323543	\N	0	0	2025-07-27 19:32:58.335345
b323a92e-f9bc-455b-b458-ae4a5f3674d9	452c7a0d-2eae-421d-9696-92e7f131254b	a688cb56-0dca-466b-840f-e277a3d1431d	rayan boss	well	2	0	f	f	2025-07-04 15:36:07.077436	\N	0	0	2025-07-27 19:32:58.583951
c3c3d541-1234-44cd-a5dd-111111113002	83bbdd02-bebb-4965-98c2-b492f11382be	0b7c0688-b9bb-42ad-ab00-de26606283fa	The Bathhouse as Society	How does the bathhouse reflect a capitalistic world?	90	0	f	f	2025-07-28 16:46:49.312758	\N	0	0	\N
c3c3d541-1234-44cd-a5dd-111111113003	83bbdd02-bebb-4965-98c2-b492f11382be	0b7c0688-b9bb-42ad-ab00-de26606283fa	Haku’s True Identity	Who or what is Haku, really?	90	0	f	f	2025-07-28 16:46:49.313656	\N	0	0	\N
c1a1d541-1234-44cd-a5dd-111111111002	0953119e-2717-4151-a1de-36868a2ba129	0b7c0688-b9bb-42ad-ab00-de26606283fa	Harvey Dent’s Tragedy	Was Harvey’s fall inevitable, or could Batman have saved him?	81	0	f	f	2025-07-28 16:38:59.086797	\N	0	0	2025-07-28 16:47:58.672682
c8c7204d-d57e-4494-8def-244660d55447	1c24d232-6fa1-4d74-a3b0-f78f642f1223	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	Van der Linde Gang Rides Again	Reunite with fellow outlaws to share stories, screenshots, and shenanigans from Red Dead Redemption 2. Whether youre chasing bounties, exploring the frontier, or just causing chaos with the Van der Linde gang—this is your hideout.	6	1	f	f	2025-07-28 08:11:10.48563	\N	0	1	2025-07-28 15:51:15.281539
ba1cab1d-705f-475b-b485-c5add714f489	e7182d74-efb3-4427-bf94-4dc6a769c5e5	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	afnaiuf asjejeejejej	sdijfjroireoir pasopfiacka ljjsjs	7	0	f	f	2025-07-26 21:50:32.408986	\N	0	0	2025-07-28 15:51:15.694658
c660eca2-a023-446f-a193-d829dc735275	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	kochu	gechu	77	6	f	f	2025-07-04 16:04:56.165374	\N	3	0	2025-07-28 16:54:41.157572
7b02afc6-aa31-41c7-a0d6-8991f8a9bfcd	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	asdfgh	qwerty	18	3	f	f	2025-07-04 14:19:37.803399	\N	0	0	2025-07-28 15:51:16.152733
e854452d-a967-4d01-ae54-aadbc09e12fc	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	no	hey boy	16	2	f	f	2025-07-03 23:28:30.127395	\N	1	0	2025-07-28 15:51:16.152631
9ee70fdb-c9f2-433e-9ebe-277d1cd83a83	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	rhrrrrrr	rrr	27	5	f	f	2025-07-04 13:41:46.256042	\N	1	0	2025-07-28 16:54:16.363534
2b29e7aa-4530-4b65-991b-0846f8438b7c	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	qq	asd	4	0	f	f	2025-07-04 13:59:44.924437	\N	0	0	2025-07-27 19:43:36.37546
c2b2d541-1234-44cd-a5dd-111111112003	17adfa53-9e99-42ab-a40e-7ca15541eb68	0b7c0688-b9bb-42ad-ab00-de26606283fa	Justice in Fiction vs. Reality	Do modern societies reflect the moral lessons of this novel?	102	0	f	f	2025-07-28 16:43:42.773635	\N	0	0	2025-07-28 16:54:16.499005
c2b2d541-1234-44cd-a5dd-111111112001	17adfa53-9e99-42ab-a40e-7ca15541eb68	0b7c0688-b9bb-42ad-ab00-de26606283fa	Atticus Finch: Hero or Idealist?	Was Atticus realistic in expecting justice from the jury?	92	0	f	f	2025-07-28 16:43:42.773635	\N	0	0	2025-07-28 16:54:16.499005
c3c3d541-1234-44cd-a5dd-111111113001	83bbdd02-bebb-4965-98c2-b492f11382be	0b7c0688-b9bb-42ad-ab00-de26606283fa	Spirits and Symbolism	What does No-Face represent in your interpretation?	91	0	f	f	2025-07-28 16:46:49.311982	\N	0	0	2025-07-28 16:54:16.503912
fd43fa7a-a60b-4349-bc41-533580643fc0	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	check	asc	90	8	f	f	2025-07-04 13:42:38.040383	2025-07-04 20:49:25.063101	1	1	2025-07-28 16:54:41.158461
c1a1d541-1234-44cd-a5dd-111111111003	0953119e-2717-4151-a1de-36868a2ba129	0b7c0688-b9bb-42ad-ab00-de26606283fa	Best Scene Debate	Which scene in The Dark Knight blew your mind the most?	124	0	f	f	2025-07-28 16:38:59.086797	\N	0	0	2025-07-28 16:55:30.570046
c1a1d541-1234-44cd-a5dd-111111111001	0953119e-2717-4151-a1de-36868a2ba129	0b7c0688-b9bb-42ad-ab00-de26606283fa	The Joker’s Philosophy	Do you think Joker’s chaos argument was valid in a world full of corruption?	106	0	f	f	2025-07-28 16:38:59.086797	\N	0	0	2025-07-28 16:55:39.839686
7cec4af6-88bf-435c-8813-732432adb428	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	fg	hi	16	2	f	f	2025-07-03 23:29:02.377085	\N	0	0	2025-07-28 15:51:19.152921
2bab3d09-8e22-492a-81f0-63c0630bef53	8612a07b-91fc-4177-b326-765af2aa76ad	a688cb56-0dca-466b-840f-e277a3d1431d	kochu	kochu	11	1	f	f	2025-07-04 16:08:34.335934	\N	1	0	2025-07-28 15:51:19.268745
adf56cb5-b51a-48a6-829f-641dc6d90e85	1153d21a-30da-4240-878c-9bbf2bc268e0	a688cb56-0dca-466b-840f-e277a3d1431d	gh	lala	5	0	f	f	2025-07-04 13:38:13.572881	\N	0	0	2025-07-28 15:51:19.267463
d3036ebc-4c9f-45b0-be33-2f25a7569d5b	68787b29-734e-4b10-a4bf-401f1ae3e3b6	a688cb56-0dca-466b-840f-e277a3d1431d	rhrrrrrr	rrr	11	0	f	f	2025-07-04 13:41:37.115403	\N	1	0	2025-07-28 15:51:19.268797
e504f340-20fa-4102-a4c4-584d00ba1bcb	0c167685-5bed-45be-aa67-3d682f5f62b6	66b1d6f4-70cf-4bcb-a038-fe570b979dd8	afd	ewr	15	0	f	f	2025-07-12 19:26:16.795334	\N	0	0	2025-07-28 16:55:49.769835
7c56fcc5-a2aa-4a72-a1cd-de8c2912e4e0	57e7af79-b324-4e3c-91af-5f5f92317e0e	a688cb56-0dca-466b-840f-e277a3d1431d	chol	chol chol	11	0	f	f	2025-07-04 13:38:59.944748	\N	0	0	2025-07-28 16:55:50.286893
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
a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	8d94cf00-7b66-4085-9eef-bc12b1b2fb62	2025-07-27 16:37:59.007212
a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	cf688658-f4d9-4164-9843-46fa75a5efd0	2025-07-27 18:10:29.191691
ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	cf688658-f4d9-4164-9843-46fa75a5efd0	2025-07-27 18:19:04.862743
ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	f235d169-c1e4-41cb-bc8b-89c6d2dae297	2025-07-27 23:37:14.979786
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	cf688658-f4d9-4164-9843-46fa75a5efd0	2025-07-28 00:15:46.613315
ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	6f1243c1-f36d-4df2-9197-92cc0d26fb24	2025-07-28 00:36:38.012185
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	6f1243c1-f36d-4df2-9197-92cc0d26fb24	2025-07-28 01:33:18.502354
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	1c24d232-6fa1-4d74-a3b0-f78f642f1223	2025-07-28 08:08:47.571384
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	0953119e-2717-4151-a1de-36868a2ba129	2025-07-28 16:40:06.149033
\.


--
-- Data for Name: user_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_recommendations (id, user_id, recommended_media_ids, recommended_club_ids, reasoning, recommendation_score, is_viewed, expires_at, created_at) FROM stdin;
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
a5f0cbe5-1f2f-4c42-bf85-aa7786abf5f2	bangi@gmail.com	\N	bangi	user	\N	user_30QYoUKmDOUWEbEM9rTL0BhhzOq	clerk	user_30QYoUKmDOUWEbEM9rTL0BhhzOq	f	\N	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yelc0YlNPZUM3VlhuNW1XRGdaNFFtZGlsaWoiLCJyaWQiOiJ1c2VyXzMwUVlvVUttRE9VV0ViRU05clRMMEJoaHpPcSJ9	2025-07-28 00:15:16.674939	clerk	2025-07-28 00:15:16.674942	clerk_clerk	clerk_clerk	2025-07-27 02:23:58.708779	2025-07-28 00:15:16.674941
07bc1ab4-81eb-492b-be67-f0a8fd43aec1	rfqrayan@gmail.com	\N	rfqrayan	user	\N	user_30SdpBDq5P0VwqUHCnoOEccwpip	clerk	user_30SdpBDq5P0VwqUHCnoOEccwpip	t	R	Rayan	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMFNkcEFkck5YQmQzanUwakZWS3NVZk5rNGQifQ	2025-07-28 16:52:51.187412	clerk	2025-07-28 16:52:51.18742	clerk_google	clerk_google	2025-07-28 16:51:41.275493	2025-07-28 16:52:51.187419
66b1d6f4-70cf-4bcb-a038-fe570b979dd8	abdullah991r@gmail.com	\N	abdullah991r	user	\N	user_2zW4r4fnKLe52bJMBEFZ03pLAm0	clerk	user_2zW4r4fnKLe52bJMBEFZ03pLAm0	t	Abdullah	Faiyaz	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yelc0ckU3RnFmSFRVNUhtaVlwNzRhSjBubTEifQ	2025-07-28 16:55:30.268188	oauth	2025-07-28 16:55:30.268193	clerk_google	clerk_google	2025-07-12 16:57:56.937479	2025-07-28 16:55:30.268191
ab5fa07d-1ea2-4f85-aa01-7848a7ed3986	dhuru@gmail.com	\N	dhuru	user	\N	user_30SQlq0s0u6SmMAM02Z9JdewpRg	clerk	user_30SQlq0s0u6SmMAM02Z9JdewpRg	f	\N	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yelc0YlNPZUM3VlhuNW1XRGdaNFFtZGlsaWoiLCJyaWQiOiJ1c2VyXzMwU1FscTBzMHU2U21NQU0wMlo5SmRld3BSZyJ9	2025-07-28 01:45:48.85228	clerk	2025-07-28 01:45:48.852286	clerk_clerk	clerk_clerk	2025-07-27 18:17:27.839018	2025-07-28 01:45:48.852285
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_generated_content ai_generated_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_generated_content
    ADD CONSTRAINT ai_generated_content_pkey PRIMARY KEY (id);


--
-- Name: ai_requests ai_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_requests
    ADD CONSTRAINT ai_requests_pkey PRIMARY KEY (id);


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
-- Name: quiz_sessions quiz_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_pkey PRIMARY KEY (id);


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
-- Name: user_recommendations user_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_recommendations
    ADD CONSTRAINT user_recommendations_pkey PRIMARY KEY (id);


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
-- Name: idx_ai_content_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_content_expires ON public.ai_generated_content USING btree (expires_at);


--
-- Name: idx_ai_content_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_content_hash ON public.ai_generated_content USING btree (content_hash);


--
-- Name: idx_ai_content_type_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_content_type_reference ON public.ai_generated_content USING btree (content_type, source_reference_type, source_reference_id);


--
-- Name: idx_ai_requests_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_requests_created_at ON public.ai_requests USING btree (created_at);


--
-- Name: idx_ai_requests_type_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_requests_type_status ON public.ai_requests USING btree (request_type, status);


--
-- Name: idx_ai_requests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_requests_user_id ON public.ai_requests USING btree (user_id);


--
-- Name: idx_quiz_sessions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_sessions_created_at ON public.quiz_sessions USING btree (created_at);


--
-- Name: idx_quiz_sessions_media_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_sessions_media_id ON public.quiz_sessions USING btree (media_id);


--
-- Name: idx_quiz_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions USING btree (user_id);


--
-- Name: idx_user_recommendations_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_recommendations_expires ON public.user_recommendations USING btree (expires_at);


--
-- Name: idx_user_recommendations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_recommendations_user_id ON public.user_recommendations USING btree (user_id);


--
-- Name: clubs clubs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clubs clubs_linked_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_linked_media_id_fkey FOREIGN KEY (linked_media_id) REFERENCES public.media(id) ON DELETE SET NULL;


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
-- Name: quiz_sessions quiz_sessions_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: quiz_sessions quiz_sessions_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: quiz_sessions quiz_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: user_recommendations user_recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_recommendations
    ADD CONSTRAINT user_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

