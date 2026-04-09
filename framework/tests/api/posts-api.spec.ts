/**
 * FRAMEWORK: tests/api/posts-api.spec.ts
 * API tests using the ApiHelper + fixtures pattern.
 *
 * Run: npx playwright test framework/tests/api/posts-api.spec.ts
 *      --config=framework/playwright.config.ts --project=api
 */

import { test, expect } from "../../fixtures";
import { logger } from "../../utils/logger";
import postsData from "../../test-data/posts.json";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

test.describe("Posts API – @api @smoke", () => {

  test("TC100 – GET all posts returns 100 items @smoke", async ({ apiHelper }) => {
    logger.step("TC100 – GET /posts");

    const response = await apiHelper.get<Post[]>("/posts");

    apiHelper.assertSuccess(response);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data).toHaveLength(100);

    logger.pass(`GET /posts → ${response.data.length} posts`);
  });

  test("TC101 – GET single post by ID @smoke", async ({ apiHelper }) => {
    logger.step("TC101 – GET /posts/1");

    const response = await apiHelper.get<Post>("/posts/1");

    apiHelper.assertSuccess(response);
    expect(response.data.id).toBe(1);
    expect(response.data.userId).toBe(1);
    expect(response.data.title).toBeTruthy();

    logger.pass(`Post title: "${response.data.title}"`);
  });

  test("TC102 – POST create new post @smoke", async ({ apiHelper }) => {
    logger.step("TC102 – POST /posts");

    const newPost = {
      title: "Framework API Test",
      body: "This post was created via Playwright ApiHelper",
      userId: 1,
    };

    const response = await apiHelper.post<Post>("/posts", newPost);

    apiHelper.assertStatus(response, 201);
    expect(response.data.title).toBe(newPost.title);
    expect(response.data.id).toBeDefined();

    logger.pass(`Created post ID: ${response.data.id}`);
  });

  test("TC103 – PUT update a post", async ({ apiHelper }) => {
    logger.step("TC103 – PUT /posts/1");

    const updated = {
      id: 1,
      title: "Updated by Framework",
      body: "Updated body content",
      userId: 1,
    };

    const response = await apiHelper.put<Post>("/posts/1", updated);

    apiHelper.assertSuccess(response);
    expect(response.data.title).toBe(updated.title);

    logger.pass(`Updated post: "${response.data.title}"`);
  });

  test("TC104 – PATCH partial update", async ({ apiHelper }) => {
    logger.step("TC104 – PATCH /posts/1");

    const response = await apiHelper.patch<Post>("/posts/1", {
      title: "Patched Title Only",
    });

    apiHelper.assertSuccess(response);
    expect(response.data.title).toBe("Patched Title Only");

    logger.pass("Patch verified");
  });

  test("TC105 – DELETE a post", async ({ apiHelper }) => {
    logger.step("TC105 – DELETE /posts/1");

    const response = await apiHelper.delete("/posts/1");

    expect(response.statusCode).toBe(200);
    expect(response.ok).toBeTruthy();
    logger.pass("Delete verified");
  });

  test("TC106 – GET 404 for missing post @regression", async ({ apiHelper }) => {
    const response = await apiHelper.get<Post>("/posts/99999");
    apiHelper.assertStatus(response, 404);
    logger.pass("404 confirmed for non-existent post");
  });

  // ── Data-driven from JSON file ─────────────────────────────────
  const validPosts = postsData.filter((p) => p.valid);
  const invalidPosts = postsData.filter((p) => !p.valid);

  for (const post of validPosts) {
    test(`TC107 – Data-driven GET post ${post.id}: valid @regression`, async ({ apiHelper }) => {
      const response = await apiHelper.get<Post>(`/posts/${post.id}`);
      apiHelper.assertSuccess(response);
      expect(response.data.id).toBe(post.id);
      logger.pass(`Post ${post.id} exists: "${response.data.title}"`);
    });
  }

  for (const post of invalidPosts) {
    test(`TC108 – Data-driven GET post ${post.id}: invalid @regression`, async ({ apiHelper }) => {
      const response = await apiHelper.get<Post>(`/posts/${post.id}`);
      apiHelper.assertStatus(response, 404);
      logger.pass(`Post ${post.id} correctly returns 404`);
    });
  }
});
