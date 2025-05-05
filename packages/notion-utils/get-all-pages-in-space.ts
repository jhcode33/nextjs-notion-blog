import PQueue from 'p-queue';
import pRetry from 'p-retry';

import { ExtendedRecordMap, PageMap } from 'notion-types';
import { parsePageId } from './parse-page-id';
import { getBlockParentPage } from 'notion-utils'; 

/**
 * Performs a traversal over a given Notion workspace starting from a seed page.
 *
 * Returns a map containing all of the pages that are reachable from the seed
 * page in the space.
 *
 * If `rootSpaceId` is not defined, the space ID of the root page will be used
 * to scope traversal.
 *
 *
 * @param rootPageId - Page ID to start from.
 * @param rootSpaceId - Space ID to scope traversal.
 * @param getPage - Function used to fetch a single page.
 * @param opts - Optional config
 */
export async function getAllPagesInSpace(
  rootPageId: string,
  rootSpaceId: string | undefined,
  getPage: (pageId: string) => Promise<ExtendedRecordMap>,
  {
    concurrency = 4,
    traverseCollections = true,
    targetPageId = null,
  }: {
    concurrency?: number;
    traverseCollections?: boolean;
    targetPageId?: string;
  } = {},
): Promise<PageMap> {
  const pages: PageMap = {};
  const pendingPageIds = new Set<string>();
  const queue = new PQueue({ concurrency });
  const allowCollectionItemIds = new Set<string>();

  async function processPage(pageId: string) {
    if (targetPageId && pendingPageIds.has(targetPageId)) {
      return;
    }

    pageId = parsePageId(pageId) as string;

    if (pageId && !pages[pageId] && !pendingPageIds.has(pageId)) {
      pendingPageIds.add(pageId);

      queue.add(async () => {
        try {
          await pRetry(
            async () => {
              if (targetPageId && pendingPageIds.has(targetPageId) && pageId !== targetPageId) {
                return;
              }

              const page = await getPage(pageId);
              // console.log(
              //   `\n---------- ${pageId} / "${
              //     page.block[pageId].value.properties['title'] || '???'
              //   }" ----------\n`,
              // );

              if (!page) {
                return;
              }

              const spaceId = page.block[pageId]?.value?.space_id;

              if (spaceId) {
                if (!rootSpaceId) {
                  rootSpaceId = spaceId;
                } else if (rootSpaceId !== spaceId) {
                  return;
                }
              }

              // the databaseId only build pages in database
              // 여기가 문제임, 데이터베이스 안에 있는 페이지들만 가져오려고 하니까 제대로 안됨.
              // 그렇다고 해서 나머지 전체도 가져오게 되면, 중복된 제목 때문에 제대로 올라가지도 않고,
              // 일부만 추출해서 사용해야지 동기화를 사용해서 제대로 할 수 있는데 안 되네?
              // if(rootDatabaseId) {
              //   console.log(
              //     `\n---------- ${pageId} rootdatabase Id / "${
              //       page.block[pageId].value?.parent_id
              //     }" ----------\n`,
              //   );
              //   if(page.block[pageId]?.value?.parent_id != rootDatabaseId) {

              //     return false
              //   }
              // }

              // CUSTOM: 데이터베이스의 보기는 첫번째것만 표시되므로 사이트맵 추출도 첫번째것만 추출 (필터링된 글은 추출이 안되도록 처리)
              // Object.values(page.block).forEach(({ value: block }) => {
              //   if (!block || !block?.type) {
              //     return;
              //   }

              //   if (block.type === 'collection_view') {
              //     const defaultViewId = block.view_ids[0];

              //     const collectionId =
              //       block.collection_id ||
              //       page?.collection_view?.[defaultViewId]?.value?.format?.collection_pointer?.id;

              //     const collectionChildPageIds =
              //       page.collection_query?.[collectionId]?.[defaultViewId]?.collection_group_results
              //         ?.blockIds || [];

              //     console.log('--');
              //     console.log('block:', block);
              //     console.log('collectionId: ', collectionId);
              //     console.log('block.view_ids: ', block.view_ids);
              //     console.log('page.collection_query: ', page.collection_query);
              //     console.log(
              //       'page.collection_query.find: ',
              //        page.collection_query?.[collectionId]?.[defaultViewId]?.collection_group_results,
              //     );
              //     console.log('collectionView', page.collection_view[defaultViewId].value);
              //     console.log('collectionChildPageIds', collectionChildPageIds);

              //     collectionChildPageIds.forEach(blockId => {
              //       allowCollectionItemIds.add(blockId);
              //     });
              //   }
              // });

              Object.keys(page.block)
              .filter((key) => {
                const block = page.block[key]?.value
                if (!block || block.alive === false) return false
  
                if (
                  block.type !== 'page' &&
                  block.type !== 'collection_view_page'
                ) {
                  return false
                }
  
                // the space id check is important to limit traversal because pages
                // can reference pages in other spaces
                if (
                  rootSpaceId &&
                  block.space_id &&
                  block.space_id !== rootSpaceId
                  
                ) {
                  return false 
                }

                // create sitemap based only on top page
                const ancestor = getBlockParentPage(block, page);
                let ancestorId = ancestor?.id;

                // getBlockParentPage가 놓치면, 직접 parent_id 체인 타기
                if (!ancestorId && block.parent_id) {
                  let currId = block.parent_id;
                  let currTable = (block as any).parent_table;
                  
                  while (currId && currTable === 'block') { // 부모가 블록(페이지)인 동안 계속 올라감
                    const parentBlock = page.block[currId]?.value;
                    if (!parentBlock) break;
                    if (currId === rootPageId) { // 최상위 rootPageId 발견 시 체인 순회 종료
                      ancestorId = currId;
                      break;
                    }
                    currId = (parentBlock as any).parent_id;
                    currTable = (parentBlock as any).parent_table;
                  }
                }

                let rootNotionPageId = parsePageId(rootPageId) as string;
                if (ancestorId !== rootNotionPageId) { 
                  return;  // rootPageId 트리 밖이므로 중단
                }
                
                console.log(
                  `\n---------- ${pageId} / "${
                    page.block[pageId].value.properties['title'] || '???' 
                  }" / "${ancestorId}" / "${rootPageId}" ----------\n`,
                );

                // CUSTOM: 데이터베이스의 보기는 첫번째것만 표시되므로 사이트맵 추출도 첫번째것만 추출 (필터링된 글은 추출이 안되도록 처리)
                // if (block.parent_table === 'collection') {
                //   if (!allowCollectionItemIds.has(block.id)) {
                //     return false;
                //   }
                // }
  
                return true
              })
              .forEach((subPageId) => processPage(subPageId))

              //traverse collection item pages as they may contain subpages as well
              if (traverseCollections) {
                for (const collectionViews of Object.values(page.collection_query)) {
                  for (const collectionData of Object.values(collectionViews)) {
                    const { blockIds } = collectionData;

                    if (blockIds) {
                      for (const collectionItemId of blockIds) {
                        processPage(collectionItemId);
                      }
                    }
                  }
                }
              }

              pages[pageId] = page;
            },
            {
              onFailedAttempt: error => {
                console.log(
                  `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`,
                );
              },
              retries: 3,
            },
          );

          // console.log('\n----------------------------------------------\n\n');
        } catch (err) {
          console.warn(
            'page load error',
            { pageId, spaceId: rootSpaceId },
            err.statusCode,
            err.message,
          );
          pages[pageId] = null;
        }

        pendingPageIds.delete(pageId);
      });
    }
  }

  await processPage(rootPageId);
  await queue.onIdle();

  return pages;
}
