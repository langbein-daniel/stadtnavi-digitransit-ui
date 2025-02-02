/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Link from 'found/Link';

import ExternalLink from './ExternalLink';
import Icon from './Icon';
import RouteNumber from './RouteNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import {
  entityCompare,
  getEntitiesOfType,
  mapAlertSource,
} from '../util/alertUtils';
import { getRouteMode } from '../util/modeUtils';

export const getTimePeriod = ({ currentTime, startTime, endTime, intl }) => {
  const at = intl.formatMessage({
    id: 'at-time',
  });
  const defaultFormat = `D.M.YYYY [${at}] HH:mm`;
  const start = capitalize(
    startTime.calendar(currentTime, {
      lastDay: `[${intl.formatMessage({ id: 'yesterday' })} ${at}] HH:mm`,
      sameDay: `[${intl.formatMessage({ id: 'today' })} ${at}] HH:mm`,
      nextDay: `[${intl.formatMessage({ id: 'tomorrow' })} ${at}] HH:mm`,
      lastWeek: defaultFormat,
      nextWeek: defaultFormat,
      sameElse: defaultFormat,
    }),
  );
  if (!endTime) {
    return start;
  }
  const end = endTime.calendar(startTime, {
    sameDay: 'HH:mm',
    nextDay: defaultFormat,
    nextWeek: defaultFormat,
    sameElse: defaultFormat,
  });
  return `${start} - ${end}`;
};

const getColor = entities => {
  if (Array.isArray(entities)) {
    const routeEntities = getEntitiesOfType(entities, 'Route');
    return routeEntities.length > 0 && `#${routeEntities[0].color}`;
  }
  return null;
};

const getMode = entities => {
  if (Array.isArray(entities)) {
    const routeEntities = getEntitiesOfType(entities, 'Route');
    return routeEntities.length > 0 && getRouteMode(routeEntities[0]);
  }
  return 'bus';
};

const getGtfsIds = entities => entities?.map(entity => entity.gtfsId) || [];

const getEntityIdentifiers = entities =>
  entities?.map(
    entity =>
      entity.shortName ||
      (entity.code ? `${entity.name} (${entity.code})` : entity.name),
  );

const getEntitiesWithUniqueIdentifiers = entities => {
  const entitiesByIdentifier = {};
  entities?.forEach(entity => {
    entitiesByIdentifier[
      entity.shortName ||
        (entity.code ? `${entity.name} (${entity.code})` : entity.name)
    ] = entity;
  });
  return Object.values(entitiesByIdentifier);
};

export default function AlertRow(
  {
    currentTime,
    description,
    color,
    endTime,
    entities,
    feed,
    header,
    mode,
    severityLevel,
    showRouteNameLink,
    showRouteIcon,
    startTime,
    url,
  },
  { intl, config },
) {
  const showTime = startTime && endTime && currentTime;
  const uniqueEntities = getEntitiesWithUniqueIdentifiers(entities).sort(
    entityCompare,
  );
  const gtfsIdList = getGtfsIds(uniqueEntities);
  const entityIdentifiers = getEntityIdentifiers(uniqueEntities);

  const routeColor = showRouteIcon && (color || getColor(uniqueEntities));
  const routeMode = showRouteIcon && (mode || getMode(uniqueEntities));

  const entityType =
    getEntitiesOfType(uniqueEntities, 'Stop').length > 0 ? 'Stop' : 'Route';

  const routeLinks =
    entityType === 'Route' && entityIdentifiers && gtfsIdList
      ? entityIdentifiers.map((identifier, i) => (
          <Link
            key={gtfsIdList[i]}
            to={`/${PREFIX_ROUTES}/${gtfsIdList[i]}/${PREFIX_STOPS}`}
            className={cx('route-alert-row-link', routeMode)}
            style={{ routeColor }}
          >
            {' '}
            {identifier}
          </Link>
        ))
      : [];

  const stopLinks =
    entityType === 'Stop' && entityIdentifiers && gtfsIdList
      ? entityIdentifiers.map((identifier, i) => (
          <Link
            key={gtfsIdList[i]}
            to={`/${PREFIX_STOPS}/${gtfsIdList[i]}`}
            className={cx('route-alert-row-link', routeMode)}
          >
            {' '}
            {identifier}
          </Link>
        ))
      : [];

  const checkedUrl =
    url && (url.match(/^[a-zA-Z]+:\/\//) ? url : `http://${url}`);

  if (!description && !header) {
    return null;
  }

  let genericCancellation;
  if (!description) {
    if (typeof header === 'string') {
      genericCancellation = header;
    } else if (header.props) {
      const { headsign, shortName, scheduledDepartureTime } = header.props;
      if (headsign && routeMode && shortName && scheduledDepartureTime) {
        const modeForTranslations = intl.formatMessage({
          id: routeMode.toLowerCase(),
        });
        genericCancellation = intl.formatMessage(
          { id: 'generic-cancelation' },
          {
            modeForTranslations,
            route: shortName,
            headsign,
            time: moment.unix(scheduledDepartureTime).format('HH:mm'),
          },
        );
      }
    }
  }

  return (
    <div className="route-alert-row" role="listitem" tabIndex={0}>
      {(showRouteIcon && (
        <RouteNumber
          alertSeverityLevel={severityLevel}
          color={routeColor}
          mode={routeMode}
        />
      )) ||
        (entityType === 'Stop' && (
          <div className="route-number">
            {severityLevel === 'INFO' ? (
              <Icon img="icon-icon_info" className="stop-disruption info" />
            ) : (
              <Icon
                img="icon-icon_caution"
                className="stop-disruption warning"
              />
            )}
          </div>
        )) || (
          <div className="route-number">
            <ServiceAlertIcon severityLevel={severityLevel} />
          </div>
        )}
      <div className="route-alert-contents">
        {mapAlertSource(config, intl.locale, feed)}
        {(entityIdentifiers || showTime) && (
          <div className="route-alert-top-row">
            {entityIdentifiers &&
              ((entityType === 'Route' &&
                showRouteNameLink &&
                routeLinks.length > 0 && <>{routeLinks} </>) ||
                (!showRouteNameLink && (
                  <div
                    className={cx('route-alert-entityid', routeMode)}
                    style={{ routeColor }}
                  >
                    {entityIdentifiers.split(' ')}{' '}
                  </div>
                )) ||
                (entityType === 'Stop' &&
                  showRouteNameLink &&
                  stopLinks.length > 0 && <>{stopLinks} </>) ||
                (!showRouteNameLink && (
                  <div className={routeMode}>
                    {entityIdentifiers.split(' ')}
                  </div>
                )))}
            {showTime && (
              <>
                {getTimePeriod({
                  currentTime: moment.unix(currentTime),
                  startTime: moment.unix(startTime),
                  endTime: description ? moment.unix(endTime) : undefined,
                  intl,
                })}
              </>
            )}
          </div>
        )}
        {(description || genericCancellation) && (
          <div className="route-alert-body">
            {description || genericCancellation}
            {url && (
              <ExternalLink className="route-alert-url" href={checkedUrl}>
                {intl.formatMessage({ id: 'extra-info' })}
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

AlertRow.propTypes = {
  currentTime: PropTypes.number,
  description: PropTypes.string,
  endTime: PropTypes.number,
  entities: PropTypes.object,
  color: PropTypes.string,
  mode: PropTypes.string,
  severityLevel: PropTypes.string,
  startTime: PropTypes.number,
  url: PropTypes.string,
  showRouteNameLink: PropTypes.bool,
  showRouteIcon: PropTypes.bool,
  header: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  feed: PropTypes.string,
};

AlertRow.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

AlertRow.defaultProps = {
  currentTime: moment().unix(),
  endTime: undefined,
  severityLevel: undefined,
  startTime: undefined,
  header: undefined,
};
