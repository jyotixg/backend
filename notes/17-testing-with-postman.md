# 📘 Day 17 — Testing with Postman (automated)

> Topic scope: turning manual API checks into automated tests + variables that flow between requests.

---

## 1. Three ideas
| Idea | Gives you |
|------|-----------|
| **Test scripts** | JS that runs after a response and **asserts** (status, body) → automatic ✅/❌ |
| **Variables** | store/reuse values (`baseUrl`, `token`); scripts can **set** them |
| **Collection Runner** | run all requests in order with a pass/fail report |

## 2. The `pm` API (in the request's Scripts/Tests tab)
```js
pm.test('status is 200', function () {
  pm.response.to.have.status(200);        // assert status code
});

const body = pm.response.json();          // parsed response body
pm.test('has accessToken', function () {
  pm.expect(body.accessToken).to.be.a('string');  // assert a field (Chai)
});

pm.collectionVariables.set('token', body.accessToken);  // SAVE into {{token}}
```
| Piece | Meaning |
|-------|---------|
| `pm.test(name, fn)` | one named test → shows in **Test Results** tab |
| `pm.response.to.have.status(n)` | status assertion |
| `pm.response.json()` | response body as an object |
| `pm.expect(x)...` | assertions (Chai: `.to.be.a`, `.to.equal`, `.to.not.have.property`, …) |
| `pm.collectionVariables.set(key, val)` | write a collection variable |

## 3. The killer pattern: auto-save the token
Login's test script saves the token, so protected requests use it automatically:
```js
if (body.accessToken)  pm.collectionVariables.set('token', body.accessToken);
if (body.refreshToken) pm.collectionVariables.set('refreshToken', body.refreshToken);
```
Then `/me`, `/admin`, etc. use `Authorization: Bearer {{token}}` → **no more copy-paste**. Refresh also re-saves the new access token.

## 4. Where to see results
After sending a request → **Test Results** tab (next to Body/Headers) shows each `pm.test` as pass/fail.

## 5. Collection Runner
Collection → **Run** → **Run Auth API** → fires every request top-to-bottom with a pass/fail report.
- **Order matters:** Login must run before protected requests so `{{token}}` is set first.
- Some requests may "fail" by state (Register → `409` if the email exists; Admin → `403` if the user isn't admin) — expected; use tolerant assertions or dedicated data.

## 6. 🐞 Lesson: test-data drift
Login started failing (`401`) because an earlier test had changed the user's password. The code was fine — the **test data** had drifted. Fix: use a **dedicated, known test user** whose credentials you control.

---

## ✅ Cheat-sheet
```js
pm.test('name', () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body.field).to.be.a('string');
pm.collectionVariables.set('token', body.accessToken);   // reuse as {{token}}
```

## 🧠 Quick self-check (revision questions)
1. What does a Postman **test script** let you do that manual checking doesn't?
2. How does `/me` get a token without you pasting one?
3. What does `pm.collectionVariables.set()` do?
4. Why must Login run before protected requests in the Collection Runner?
5. Login returned 401 in testing though the code was correct — what was the real cause?
