import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import { buildClientSchema, getIntrospectionQuery } from "graphql";

import "graphiql/graphiql.css";
import "../css/graphiql-orchard.css";

function getIntrospectionUrl(): string {
    return document
        .getElementById("graphiql")
        .dataset.introspectionUrl;
}

function fetcher(params: Object): Promise<any> {
    var introspectionUrl = getIntrospectionUrl();
    return fetch(
        introspectionUrl,
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params),
            credentials: 'include'
        }
    )
    .then(function(response) {
        return response.text();
    })
    .then(function(responseBody) {
        try {
            return JSON.parse(responseBody);
        } catch (e) {
            return responseBody;
        }
    });
}

function App() {
    const _graphiql = useRef(null);
    // Gets a graphql query from the URL if present and sets it as the default query.
    var parameters: any = parseQueryFromUrl(window.location);

    const [query, setQuery] = useState(parameters.query);
    const [schema, setSchema] = useState(null);
    const [explorerIsOpen, setExplorerIsOpen] = useState(true);

    useEffect(() => {
        fetcher({
            query: getIntrospectionQuery()
        }).then(result => {
            setSchema(buildClientSchema(result.data));
        });
    }, []);

    function handleEditQuery(query: string) {
        setQuery(query);
        parameters.query = query;
        updateURL();
    }

    function handleToggleExplorer() {
        setExplorerIsOpen(!explorerIsOpen);
    }

    function onEditVariables(newVariables) {
        parameters.variables = newVariables;
        updateURL();
    }

    function onEditOperationName(newOperationName) {
        parameters.operationName = newOperationName;
        updateURL();
    }

    function parseQueryFromUrl(location: Location) {
        var params: any = {};
        location.search.substr(1).split('&').forEach(function (entry) {
            var eq = entry.indexOf('=');
            if (eq >= 0) {
                params[decodeURIComponent(entry.slice(0, eq))] =
                    decodeURIComponent(entry.slice(eq + 1));
            }
        });
        // if variables was provided, try to format it.
        if (params.variables) {
            try {
                params.variables =
                    JSON.stringify(JSON.parse(params.variables), null, 2);
            } catch (e) {
                // Do nothing, we want to display the invalid JSON as a string, rather
                // than present an error.
            }
        }

        return params;
    }

    function updateURL() {
        var newSearch = '?' + Object.keys(parameters).filter(function (key) {
            return Boolean(parameters[key]);
        }).map(function (key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(parameters[key]);
        }).join('&');
        history.replaceState(null, null, newSearch);
    }

    return (
        <div className="graphiql-container">
            <GraphiQLExplorer
                schema={schema}
                query={query}
                onEdit={handleEditQuery}
                onRunOperation={operationName =>
                    _graphiql.current.handleRunQuery(operationName)
                }
                explorerIsOpen={explorerIsOpen}
                onToggleExplorer={handleToggleExplorer}
            />
            {/*@ts-ignore */}
            <GraphiQL ref={_graphiql}
                fetcher={fetcher}
                schema={schema}
                variables={parameters.variables}
                operationName={parameters.operationName}
                onEditVariables={onEditVariables}
                onEditOperationName={onEditOperationName}
                query={query}
                onEditQuery={handleEditQuery}
            >
                <GraphiQL.Toolbar>
                    <GraphiQL.Button
                        onClick={() => _graphiql.current.handlePrettifyQuery()}
                        label="Prettify"
                        title="Prettify Query (Shift-Ctrl-P)"
                    />
                    <GraphiQL.Button
                        onClick={() => _graphiql.current.handleToggleHistory()}
                        label="History"
                        title="Show History"
                    />
                    <GraphiQL.Button
                        onClick={handleToggleExplorer}
                        label="Explorer"
                        title="Toggle Explorer"
                    />
                </GraphiQL.Toolbar>
            </GraphiQL>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("graphiql"));
