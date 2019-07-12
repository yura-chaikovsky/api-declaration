# api-decorator
Declarative client side API decorator

#Import into project

File `api.js`:

```javascript
import ApiFactory from 'api-declarations';
import declarations from './decalration.js';

const Api = new ApiFactory(BASE_URL, declarations);

export default Api;

```

Usage:
```javascript
import Api from "./services/api.js"

Api.users.get({id: 42}); 
// calls [GET] BASE_URL/users/42


Api.users.find({active: true}); 
// calls [GET] BASE_URL/users?active=true


Api.subscription.add({id:42}, payload) 
//calls [POST] BASE_URL/users/42/subscription


Api.subscription.remove({id:42}) 
//calls [DELETE] BASE_URL/users/42/subscription

Api.users.find({active: true})
    .then(response => {
        console.log("Headers:", response.headers);
        console.log("Body:", response.body);
    })
```


Declaring api in `declaration.js`:

```javascript
export default {
 
  users: {
    _model: "Users",
    _cache: true,
    
    get: {
      url: "/users/{id}"
    },
    
    find: {
      url: "/users",
      options: ["active"]
    }
  },
  
  subscription: {
    _meta: "info",
    
    add: {
      url: "/users/{id}/subscription",
      method: "post"
    },
    
    remove: {
      url: "/users/{id}/subscription",
      method: "delete"
    }
  }

}
```