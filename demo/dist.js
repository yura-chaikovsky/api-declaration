class ApiFactory {
    constructor(baseUrl, declarations, options = {}) {
        if(!baseUrl || baseUrl.substr(-1) === "/") {
            throw new Error(`Base url should be set and should not have "/" in the end, given "${baseUrl}".`);
        }

        this._baseUrl = baseUrl;
        this._options = options;
        this.headers = {"Content-Type": "application/json"};
        buildApi.call(this, declarations);
    }

    _call(method, url, payload) {
        return fetch(url,{
            method,
            mode: this._options.cors,
            cache: this._options.cache,
            credentials: this._options.credentials,
            headers: Object.assign({}, this._options.headers, this.headers),
            redirect: this._options.redirect,
            referrer: this._options.referrer,
            body: payload === null? undefined : JSON.stringify(payload)
        })
            .then(response => Promise.all([response, response.json()]))
            .then(([response, body]) => ({
                headers: response.headers,
                body
            }));
    }
}

function buildApi(declarations) {
    Object.entries(declarations).forEach(([apiName, declaration]) => {
        this[apiName] = {};
        const metaData = {meta: {}};

        Object.entries(declaration).forEach(([method, execParams]) => {
            if(method[0] === "_") {
                metaData.meta[method.substring(1)] = execParams;
                return;
            }

            if(!execParams.url || execParams.url[0] !== "/") {
                throw new Error(`Endpoint url should be set and should start with "/", given "${execParams.url}".`);
            }
            this[apiName][method] = createEndpoint(
                execParams,
                execParams.method? execParams.method : (["get", "post", "put", "delete"].includes(method)? method : "get"),
                metaData).bind(this);
        });
    });
}

function createEndpoint(execParams, httpMethod, meta) {
    return function (options, payload = null) {
        return this._call(httpMethod, buildUrl(this._baseUrl, execParams, options), payload)
            .then(response => Object.assign(response, meta));
    }
}

function buildUrl(baseUrl, execParams, options) {
    const queryOptions = execParams.options? Object.entries(options).reduce((queryOptions, [key, value]) => {
        if(execParams.options.includes(key)) {
            queryOptions.push(`${key}=${encodeURIComponent(value)}`);
        } else {
            throw new Error(`Passed query string key "${key}" does not exists in declaration for "${execParams.url}".`);
        }
        return queryOptions;
    }, []) : [];

    const url = execParams.url.replace(/{(\w+)}/g, (m, key, offset, url) => {
        if(!options.hasOwnProperty(key)) {
            throw new Error(`Missing required parameter "${key}" in url "${url}".`);
        }
        return options[key];
    });

    return baseUrl + url + (queryOptions.length? `?${queryOptions.join("&")}` : "");
}