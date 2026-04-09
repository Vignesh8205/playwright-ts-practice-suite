/**
 * EXAMPLES: 07 – API Testing with Playwright
 *
 * Demonstrates: GET, POST, PUT, DELETE, Auth headers,
 *               response validation, schema checks.
 *
 * Run: npx playwright test examples/07-api-testing/
 * API: https://jsonplaceholder.typicode.com (free public REST API)
 */

import { test, expect, APIRequestContext } from "@playwright/test";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS — Model the API response shapes
// ════════════════════════════════════════════════════════════════

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

// ════════════════════════════════════════════════════════════════
// 1. GET REQUESTS
// ════════════════════════════════════════════════════════════════

test("01 – GET all posts", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/posts`);

  // Status assertion
  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  // Parse response body
  const posts: Post[] = await response.json();

  // Assert array length and shape
  expect(Array.isArray(posts)).toBeTruthy();
  expect(posts).toHaveLength(100);
  expect(posts[0]).toMatchObject({
    userId: expect.any(Number),
    id: expect.any(Number),
    title: expect.any(String),
    body: expect.any(String),
  });

  console.log(`✅ GET /posts → ${posts.length} posts`);
  console.log("  First post:", posts[0].title);
});

test("02 – GET single post by ID", async ({ request }) => {
  const postId = 1;
  const response = await request.get(`${BASE_URL}/posts/${postId}`);

  expect(response.status()).toBe(200);
  const post: Post = await response.json();

  // Assert specific values
  expect(post.id).toBe(postId);
  expect(post.userId).toBe(1);
  expect(post.title).toBeTruthy();

  console.log(`✅ GET /posts/${postId} → "${post.title}"`);
});

test("03 – GET with query parameters", async ({ request }) => {
  // Filter posts by userId
  const response = await request.get(`${BASE_URL}/posts`, {
    params: { userId: "1" },
  });

  expect(response.status()).toBe(200);
  const posts: Post[] = await response.json();

  // All returned posts should belong to userId=1
  expect(posts.length).toBeGreaterThan(0);
  posts.forEach((post) => {
    expect(post.userId).toBe(1);
  });

  console.log(`✅ GET /posts?userId=1 → ${posts.length} posts for user 1`);
});

test("04 – GET comments for a post", async ({ request }) => {
  const postId = 1;
  const response = await request.get(`${BASE_URL}/posts/${postId}/comments`);

  expect(response.status()).toBe(200);
  const comments: Comment[] = await response.json();

  expect(comments.length).toBeGreaterThan(0);
  comments.forEach((comment) => {
    expect(comment.postId).toBe(postId);
    expect(comment.email).toMatch(/@/); // valid email format
  });

  console.log(`✅ GET /posts/${postId}/comments → ${comments.length} comments`);
});

test("05 – GET 404 for non-existent resource", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/posts/99999`);

  expect(response.status()).toBe(404);
  expect(response.ok()).toBeFalsy();

  console.log("✅ 404 returned for non-existent post");
});

// ════════════════════════════════════════════════════════════════
// 2. POST REQUESTS
// ════════════════════════════════════════════════════════════════

test("06 – POST create a new post", async ({ request }) => {
  const newPost = {
    title: "Playwright API Testing",
    body: "Playwright makes API testing simple and powerful.",
    userId: 1,
  };

  const response = await request.post(`${BASE_URL}/posts`, {
    data: newPost,
    headers: { "Content-Type": "application/json" },
  });

  expect(response.status()).toBe(201);

  const created: Post = await response.json();
  expect(created.title).toBe(newPost.title);
  expect(created.body).toBe(newPost.body);
  expect(created.userId).toBe(newPost.userId);
  expect(created.id).toBeDefined(); // Server assigns ID
  expect(created.id).toBeGreaterThan(0);

  console.log(`✅ POST /posts → Created post ID: ${created.id}`);
});

test("07 – POST with request headers", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/posts`, {
    data: {
      title: "Test Post with Headers",
      body: "Testing custom headers",
      userId: 2,
    },
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-version": "v1",
      "Authorization": "Bearer fake-token-for-demo",
    },
  });

  // JSONPlaceholder ignores auth but accepts the request
  expect(response.status()).toBe(201);
  const created: Post = await response.json();
  expect(created.id).toBeDefined();

  console.log("✅ POST with custom headers — Created ID:", created.id);
});

// ════════════════════════════════════════════════════════════════
// 3. PUT / PATCH REQUESTS
// ════════════════════════════════════════════════════════════════

test("08 – PUT update a post (full replace)", async ({ request }) => {
  const postId = 1;
  const updatedPost = {
    id: postId,
    title: "Updated Title via PUT",
    body: "This post was fully replaced via PUT request.",
    userId: 1,
  };

  const response = await request.put(`${BASE_URL}/posts/${postId}`, {
    data: updatedPost,
  });

  expect(response.status()).toBe(200);
  const updated: Post = await response.json();
  expect(updated.title).toBe(updatedPost.title);
  expect(updated.id).toBe(postId);

  console.log(`✅ PUT /posts/${postId} → Updated title: "${updated.title}"`);
});

test("09 – PATCH update a post (partial update)", async ({ request }) => {
  const postId = 1;

  const response = await request.patch(`${BASE_URL}/posts/${postId}`, {
    data: { title: "Patched Title Only" },
  });

  expect(response.status()).toBe(200);
  const patched: Post = await response.json();
  expect(patched.title).toBe("Patched Title Only");
  expect(patched.body).toBeTruthy(); // Body unchanged

  console.log(`✅ PATCH /posts/${postId} → New title: "${patched.title}"`);
});

// ════════════════════════════════════════════════════════════════
// 4. DELETE REQUESTS
// ════════════════════════════════════════════════════════════════

test("10 – DELETE a post", async ({ request }) => {
  const postId = 1;
  const response = await request.delete(`${BASE_URL}/posts/${postId}`);

  // 200 on JSONPlaceholder (some APIs return 204 No Content)
  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  console.log(`✅ DELETE /posts/${postId} → Status: ${response.status()}`);
});

// ════════════════════════════════════════════════════════════════
// 5. RESPONSE HEADERS & METADATA
// ════════════════════════════════════════════════════════════════

test("11 – Validate response headers", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/posts/1`);

  // Check content-type
  const contentType = response.headers()["content-type"];
  expect(contentType).toContain("application/json");

  // Check all headers
  const headers = response.headers();
  console.log("✅ Response headers:", {
    "content-type": headers["content-type"],
    "cache-control": headers["cache-control"],
    "x-powered-by": headers["x-powered-by"],
  });
});

// ════════════════════════════════════════════════════════════════
// 6. API + UI HYBRID TEST
// ════════════════════════════════════════════════════════════════

test("12 – API setup then UI verification", async ({ page, request }) => {
  /**
   * HYBRID TESTING PATTERN:
   * - Use API to set up test state (fast!)
   * - Use UI to verify end-to-end behavior
   *
   * This is faster than doing setup via UI.
   */

  // Step 1: Create a post via API
  const apiResponse = await request.post(`${BASE_URL}/posts`, {
    data: {
      title: "Hybrid Test Post",
      body: "Created via API, verified via UI concept",
      userId: 1,
    },
  });
  expect(apiResponse.status()).toBe(201);
  const post: Post = await apiResponse.json();
  console.log("  API created post ID:", post.id);

  // Step 2: Navigate to a related UI page
  await page.goto(`https://jsonplaceholder.typicode.com/`);
  await expect(page).toHaveTitle(/JSON/);

  console.log("✅ Hybrid API + UI test completed");
});

// ════════════════════════════════════════════════════════════════
// 7. DATA-DRIVEN API TESTS
// ════════════════════════════════════════════════════════════════

const postIds = [1, 2, 3, 4, 5];

for (const id of postIds) {
  test(`13 – Data-driven: GET post ${id}`, async ({ request }) => {
    const response = await request.get(`${BASE_URL}/posts/${id}`);
    expect(response.status()).toBe(200);

    const post: Post = await response.json();
    expect(post.id).toBe(id);
    expect(post.title).toBeTruthy();
    expect(post.body).toBeTruthy();

    console.log(`✅ Post ${id}: "${post.title.substring(0, 50)}..."`);
  });
}
