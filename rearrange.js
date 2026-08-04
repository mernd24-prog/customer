const fs = require('fs');

const file = '/home/user/Desktop/curtomer/customer/src/pages/orders/OrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// The markers for the blocks
const docStart = `              {!track && (
                <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-ink">`;
const docEnd = `                  </div>
                </section>
              )}`;

const stickyStart = `            {!track && (
              <StickySidebarLayout
                sidebarPosition="right"`;
const stickyEnd = `                  )
                }
              />
            )}`;

const returnEnd = `                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}`;

const orderProgressStart = `              {hasKnownStatus(order) && (
                <OrderDetailSectionCard
                  title={`;

// Extract documents block
const docStartIdx = content.indexOf(docStart);
const docEndIdx = content.indexOf(docEnd, docStartIdx) + docEnd.length;
const docBlock = content.slice(docStartIdx, docEndIdx);

// Extract Sticky block
const stickyStartIdx = content.indexOf(stickyStart);
const stickyEndIdx = content.indexOf(stickyEnd, stickyStartIdx) + stickyEnd.length;
const stickyBlock = content.slice(stickyStartIdx, stickyEndIdx);

// Now we want to remove docBlock and stickyBlock from their original places
// First remove docBlock, also remove the </section> after it.
let newContent = content.slice(0, docStartIdx) + content.slice(docEndIdx);
// The section tag is just below docEnd. Let's find it.
const sectionCloseIdx = newContent.indexOf('            </section>', docStartIdx);
if (sectionCloseIdx !== -1) {
    newContent = newContent.slice(0, sectionCloseIdx) + newContent.slice(sectionCloseIdx + 22);
}

// Remove sticky block
const newStickyStartIdx = newContent.indexOf(stickyStart);
const newStickyEndIdx = newStickyStartIdx + stickyBlock.length;
newContent = newContent.slice(0, newStickyStartIdx) + newContent.slice(newStickyEndIdx);

// Now we have a content string without documents, without section close, without sticky.
// 1. Insert StickySidebarLayout before OrderProgress
// 2. Wrap OrderProgress + Shipments in a new section or just keep it in the same section?
// Wait, if I insert StickySidebarLayout before OrderProgress, it will be inside the section. Is that bad?
// It's a grid item. It's fine. 
// Wait, the user wants StickySidebarLayout after the top grid and before OrderProgress.
const progressIdx = newContent.indexOf(orderProgressStart);
// Let's close the section before sticky, insert sticky, and open a new section for progress.
const injection1 = `            </section>\n\n${stickyBlock}\n\n            <section className="grid gap-4 sm:gap-8">\n`;
newContent = newContent.slice(0, progressIdx) + injection1 + newContent.slice(progressIdx);

// 3. Now insert section close after ShipmentTrackingPanel, which is just before Cancellations.
// Wait, Cancellations starts with:
const cancellationsStart = `            {cancellations.length > 0 && (`;
const cancelIdx = newContent.indexOf(cancellationsStart);
// Insert section close just before Cancellations
const injection2 = `            </section>\n\n`;
newContent = newContent.slice(0, cancelIdx) + injection2 + newContent.slice(cancelIdx);

// 4. Finally insert Order Documents block after Return block.
const rEndIdx = newContent.indexOf(returnEnd) + returnEnd.length;
const injection3 = `\n\n${docBlock}\n`;
newContent = newContent.slice(0, rEndIdx) + injection3 + newContent.slice(rEndIdx);

fs.writeFileSync(file, newContent, 'utf8');
console.log("Done");
