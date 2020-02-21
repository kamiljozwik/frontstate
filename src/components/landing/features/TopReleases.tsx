import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { SubcategoryNode, ListItem, getReleaseType, getLastReleases, featuresData } from '../../../shared';
import { FeatureSection } from './FeatureSection';
import { ToolName, ReleaseTags, ReleaseLabels, ReleaseItemProps } from '../../../pages/releases';
import { Feed } from 'semantic-ui-react';
import moment from 'moment';
import { ToolIcon, LinkButton } from '../..';
import styled from '@emotion/styled';

interface TopReleasesQuery {
  allContentfulToolEntry: {
    edges: SubcategoryNode[];
  };
}

const filterPopular = (itemData?: ListItem) => {
  const [releaseType, isMajorCorrect] = itemData?.fields.githubData?.repository.releases
    ? getReleaseType(itemData?.fields.githubData?.repository.releases.nodes)
    : [];
  const POPULAR_LEVEL = 30000;

  const isImportant = releaseType === 'major' || releaseType === 'minor';
  const isPopular =
    itemData?.fields.githubData && itemData?.fields.githubData.stars
      ? itemData?.fields.githubData.stars > POPULAR_LEVEL
      : false;
  return isImportant && isPopular && isMajorCorrect;
};

const ReleaseItemBasic = ({ tool, url, stars = 0, releases }: ReleaseItemProps) => {
  return (
    <ReleaseItemBasicWrapper>
      <Feed.Content>
        <Feed.Date>
          {`${moment(releases[1].publishedAt).format('D MMM YYYY | HH:MM')} (${moment(
            releases[1].publishedAt
          ).fromNow()})`}
        </Feed.Date>
        <Feed.Summary>
          <ToolIcon url={url} style={{ width: '16px', height: 'auto' }} />
          <ToolName>{tool}</ToolName>
        </Feed.Summary>
        <ReleaseTags releases={releases} url={url} />
        <ReleaseLabels releases={releases} />
      </Feed.Content>
    </ReleaseItemBasicWrapper>
  );
};

export const TopReleases = () => {
  const {
    allContentfulToolEntry: { edges },
  } = useStaticQuery(graphql`
    query TopReleases {
      allContentfulToolEntry {
        edges {
          node {
            fields {
              githubData {
                stars
                repository {
                  name
                  releases {
                    nodes {
                      name
                      isPrerelease
                      isDraft
                      publishedAt
                      tagName
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `) as TopReleasesQuery;

  const releases = edges
    .filter(e => e.node.fields.githubData)
    .map(e => e.node)
    .filter(getLastReleases)
    .filter(filterPopular)
    .slice(0, 4)
    .map(el => ({
      name: el.fields.githubData?.repository.name,
      website: el.website,
      stars: el.fields.githubData?.stars,
      releases: el.fields.githubData?.repository.releases.nodes,
    }));

  return (
    <FeatureSection title={featuresData.releases.title} subtitle={featuresData.releases.description}>
      <FeatureSection.Info>
        <ReleasesList>
          {releases.map(release => (
            <ReleaseItemBasic
              key={release.name}
              tool={release.name}
              url={release.website}
              stars={release.stars}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              releases={release.releases!}
            />
          ))}
        </ReleasesList>
      </FeatureSection.Info>
      <FeatureSection.Info
        title={featuresData.releases.extraData.title}
        desc={featuresData.releases.extraData.description}
        textOnly
      >
        <LinkButton to="/releases">More</LinkButton>
      </FeatureSection.Info>
    </FeatureSection>
  );
};

const ReleasesList = styled(Feed)`
  &&& {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
  }
`;

const ReleaseItemBasicWrapper = styled(Feed.Event)`
  &&&&& {
    width: 300px;
    padding: 20px 30px;
    margin: 10px;
    border-radius: 16px;
    box-shadow: 0 2px 7px -2px rgba(0, 0, 0, 0.3);
  }
`;
