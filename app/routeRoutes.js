/* eslint-disable react/jsx-key */

import React from 'react';
import Route from 'found/lib/Route';
import Redirect from 'found/lib/Redirect';
import { graphql } from 'react-relay';

import Error404 from './component/404';
import { PREFIX_DISRUPTION, PREFIX_ROUTES, PREFIX_STOPS } from './util/path';
import {
  getDefault,
  getComponentOrNullRenderer,
  getComponentOrLoadingRenderer,
} from './util/routerUtils';
import { prepareServiceDay } from './util/dateParamUtils';

export default (
  <Route path={`/${PREFIX_ROUTES}`}>
    <Route Component={Error404} />
    {/* TODO: Should return list of all routes */}
    <Route path=":routeId">
      {{
        title: (
          <Route
            path="(.*)?"
            getComponent={() =>
              import(/* webpackChunkName: "route" */ './component/RouteTitle').then(
                getDefault,
              )
            }
            query={graphql`
              query routeRoutes_RouteTitle_Query($routeId: String!) {
                route(id: $routeId) {
                  ...RouteTitle_route
                }
              }
            `}
            render={getComponentOrNullRenderer}
          />
        ),
        meta: (
          <Route
            path="(.*)?"
            getComponent={() =>
              import(/* webpackChunkName: "route" */ './component/RoutePageMeta').then(
                getDefault,
              )
            }
            query={graphql`
              query routeRoutes_RoutePageMeta_Query($routeId: String!) {
                route(id: $routeId) {
                  ...RoutePageMeta_route
                }
              }
            `}
            render={getComponentOrNullRenderer}
          />
        ),
        header: (
          <Route
            path="(.*)?"
            getComponent={() =>
              import(/* webpackChunkName: "route" */ './component/RoutePage').then(
                getDefault,
              )
            }
            query={graphql`
              query routeRoutes_RoutePage_Query(
                $routeId: String!
                $date: String!
              ) {
                route(id: $routeId) {
                  ...RoutePage_route @arguments(date: $date)
                }
              }
            `}
            prepareVariables={prepareServiceDay}
            render={getComponentOrNullRenderer}
          />
        ),
        map: [
          <Route
            path={`${PREFIX_STOPS}/:patternId/:tripId`}
            getComponent={() =>
              import(/* webpackChunkName: "route" */ './component/RouteMapContainer').then(
                getDefault,
              )
            }
            query={graphql`
              query routeRoutes_RouteMapContainer_withTrip_Query(
                $patternId: String!
                $tripId: String!
              ) {
                pattern(id: $patternId) {
                  ...RouteMapContainer_pattern
                }
                trip(id: $tripId) {
                  ...RouteMapContainer_trip
                }
              }
            `}
            render={getComponentOrNullRenderer}
          />,
          <Route
            path=":type/:patternId/(.*)?"
            getComponent={() =>
              import(/* webpackChunkName: "route" */ './component/RouteMapContainer').then(
                getDefault,
              )
            }
            query={graphql`
              query routeRoutes_RouteMapContainer_Query($patternId: String!) {
                pattern(id: $patternId) {
                  ...RouteMapContainer_pattern
                }
              }
            `}
            render={({ Component, props }) =>
              Component && props ? <Component {...props} trip={null} /> : null
            }
          />,
          <Route path="(.?)*" />,
        ],
        content: [
          <Route path={PREFIX_STOPS}>
            <Redirect
              to={`/${PREFIX_ROUTES}/:routeId/${PREFIX_STOPS}/:routeId%3A0%3A01`}
            />
            <Route
              path=":patternId"
              getComponent={() =>
                import(/* webpackChunkName: "route" */ './component/PatternStopsContainer').then(
                  getDefault,
                )
              }
              query={graphql`
                query routeRoutes_PatternStopsContainer_Query(
                  $patternId: String!
                ) {
                  pattern(id: $patternId) {
                    ...PatternStopsContainer_pattern
                      @arguments(patternId: $patternId)
                  }
                }
              `}
              prepareVariables={prepareServiceDay}
              render={getComponentOrLoadingRenderer}
            />
            <Route
              path=":patternId/:tripId"
              getComponent={() =>
                import(/* webpackChunkName: "route" */ './component/TripStopsContainer').then(
                  getDefault,
                )
              }
              query={graphql`
                query routeRoutes_TripStopsContainer_Query(
                  $patternId: String!
                  $tripId: String!
                ) {
                  pattern(id: $patternId) {
                    ...TripStopsContainer_pattern
                  }
                  trip(id: $tripId) {
                    ...TripStopsContainer_trip
                  }
                }
              `}
              render={getComponentOrLoadingRenderer}
            />
          </Route>,
          <Route path="aikataulu">
            <Redirect
              to={`/${PREFIX_ROUTES}/:routeId/aikataulu/:routeId%3A0%3A01`}
            />
            <Route
              path=":patternId"
              disableMapOnMobile
              getComponent={() =>
                import(/* webpackChunkName: "route" */ './component/RouteScheduleContainer').then(
                  getDefault,
                )
              }
              query={graphql`
                query routeRoutes_RouteScheduleContainer_Query(
                  $patternId: String!
                ) {
                  pattern(id: $patternId) {
                    ...RouteScheduleContainer_pattern
                  }
                }
              `}
              render={getComponentOrLoadingRenderer}
            />
          </Route>,
          <Route path={PREFIX_DISRUPTION}>
            <Redirect
              to={`/${PREFIX_ROUTES}/:routeId/${PREFIX_DISRUPTION}/:routeId%3A0%3A01`}
            />
            <Route
              path=":patternId"
              getComponent={() =>
                import(/* webpackChunkName: "route" */ './component/RouteAlertsContainer').then(
                  getDefault,
                )
              }
              query={graphql`
                query routeRoutes_RouteAlertsContainer_Query(
                  $routeId: String!
                  $date: String!
                ) {
                  route(id: $routeId) {
                    ...RouteAlertsContainer_route @arguments(date: $date)
                  }
                }
              `}
              prepareVariables={prepareServiceDay}
              render={getComponentOrLoadingRenderer}
            />
          </Route>,
        ],
      }}
    </Route>
  </Route>
);
