import React, {useEffect} from "react";

import mapboxgl from 'mapbox-gl';
import AWS from 'aws-sdk';
import {Signer} from '@aws-amplify/core';
import 'mapbox-gl/dist/mapbox-gl.css'

// configuration
const identityPoolId = process.env.REACT_APP_IDENTITY_POOL_ID; // Cognito Identity Pool ID
const mapName = process.env.REACT_APP_MAP_NAME; // Amazon Location Service Map Name

// extract the region from the Identity Pool ID
AWS.config.region = identityPoolId.split(":")[0];

// instantiate a Cognito-backed credential provider
const credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: identityPoolId,
});

const App = () => {

  /**
   * Initialize a map.
   */
  useEffect(() => {
    (async () => {
      // load credentials and set them up to refresh
      await credentials.getPromise();

      // actually initialize the map
      const map = new mapboxgl.Map({
        container: "root",
        center: [139.75, 35.68], // initial map centerpoint
        zoom: 14, // initial map zoom
        style: mapName,
        transformRequest: (url, resourceType) => {
          if (resourceType === "Style" && !url.includes("://")) {
            // resolve to an AWS URL
            url = `https://maps.geo.${AWS.config.region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
          }
      
          if (url.includes("amazonaws.com")) {
            // only sign AWS requests (with the signature as part of the query string)
            return {
              url: Signer.signUrl(url, {
                access_key: credentials.accessKeyId,
                secret_key: credentials.secretAccessKey,
                session_token: credentials.sessionToken,
              }),
            };
          }
      
          // don't sign
          return { url };
        },
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-left");
    })()
  }, [])

  return (
    <></>
  );
}

export default App;