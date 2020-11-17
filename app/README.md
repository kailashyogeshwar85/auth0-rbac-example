### RBAC Implementation

## Pre Requisites

Kindly follow below link to configure extensions.

- MongoDB
- Install Auth0 Authorization Extension
- Create Permissions/Scopes eg: event:read, event:update
- Assign Role to User form Authorization Extension page
- Create Two Application EventAPI, EventManagementSPA


### Auth0 Rule to add Role Information
Create a blank Role and add below details keep the role below authorization role which will be added automatically after you install Auth0 Extension.

**Rule Name**: Add Role to AccessToken
```js
 function (user, context, callback) {
  var namespace = "http://manageyourevents.com/";
  var permissions = user.permissions || [];
  var requestedScopes = context.request.body.scope || context.request.query.scope;
  var filteredScopes = requestedScopes.split(' ').filter( function(x) {
    return x.indexOf(':') < 0;
  });
  var allScopes = filteredScopes.concat(permissions);
  context.accessToken.scope = allScopes.join(' ');

  context.idToken[namespace + 'roles'] = user.roles;
  context.accessToken[namespace + 'roles'] = user.roles;
  callback(null, user, context);
}
```

### Profile Object
```json
{
  "http://manageyourevents.com/roles": [
    "Participant"
  ],
  "nickname": "harriya",
  "name": "Apka Hariya",
  "picture": "https://gravatar.com",
  "updated_at": "2020-11-17T11:57:09.157Z",
  "email": "apkahariya@gmail.com",
  "email_verified": true,
  "sub": "auth0|123"
}
```

### Scopes Requirement:
- Organizer: event:create, event:update, event:delete, event:view
- Participant: event:register, event:view

### Endpoints
**NOTE**: endpoints are prefixed with /api

| Method   |      PATH              | Required Scopes |
|----------|:----------------------:| ---------------:|
| GET      |  /events               |  event:view     |
| GET      |  /event/:id            |  event:view     |
| POST     |  /event                |  event:create   |
| PUT      |  /event/:id            |  event:update   |
| DELETE   |  /event/:id            |  event:delete   |
| POST     |  /event/:id            |  event:register |
| GET      |  /events/registrations |  event:view     |


### Demo
![Demo](images/demo.gif)

### Roles
- Organizer: Event Organizer who will create, update, delete events and event details.
- Participant: A user who wished to participate in an event.

### Links
[RBAC Setup](https://auth0.com/docs/authorization/rbac)