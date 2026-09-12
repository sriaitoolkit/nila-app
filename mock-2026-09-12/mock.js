/* Nila v1 mock - 5 divergent design DIRECTIONS x 12 beats.
   Each direction owns its composition, card anatomy, hierarchy and motion
   language; shared only: type scale, fluid clamps, one-focus invariant,
   real copy, real art. Render: ?theme=<clay|storybook|lantern|blocks|garden>&screen=<beat> */
const A = "assets";
const STAR = '<svg viewBox="0 0 100 100"><path d="M50 6 L61 38 L95 38 L67 58 L77 91 L50 71 L23 91 L33 58 L5 38 L39 38 Z"/></svg>';
const PENCIL = '<svg viewBox="0 0 24 24" width="58%" height="58%"><path d="M3 17.2V21h3.8L17.9 9.9l-3.8-3.8L3 17.2zM20.7 7.1c.4-.4.4-1 0-1.4l-2.4-2.4c-.4-.4-1-.4-1.4 0l-1.8 1.8 3.8 3.8 1.8-1.8z" fill="#7a6a4f"/></svg>';

const CARDS = {
  snack:   { t: "At the shop, order your own snack all by yourself.", d: "A big-kid moment.", img: `${A}/tiles/v0-order-own-your-own-snack.jpg` },
  retell:  { t: "Tell the family one funny thing that happened today.", d: "With a beginning and an ending.", img: `${A}/tiles/v1-retell-funny-moment.jpg` },
  notice:  { t: "Tell someone at home one thing you noticed them trying hard at.", d: "", img: `${A}/tiles/v1-kind-notice-effort.jpg` },
  water:   { t: "Drink 1 l water for 3 days.", d: "", img: `${A}/tiles/placeholder-card.jpg`, sketch: true },
  explore: { t: "Go on an explorer walk and find five red things.", d: "", img: `${A}/tiles/v0-explorer-walk-red-things.jpg` },
  fort:    { t: "Build a reading corner with a torch.", d: "", img: `${A}/tiles/v0-fort-build-a-reading-corner-with-a-torch.jpg` },
  snack2:  { t: "Build a snack table for the family.", d: "", img: `${A}/tiles/v0-fort-build-a-snack-table.jpg` },
  dream:   { t: "Draw your dream home.", d: "", img: `${A}/tiles/v0-draw-your-dream-home-boy.jpg` },
};

const sky = `<div class="sky"></div>`;
const brand = `<img class="brand" src="${A}/characters/elephant-stand.png" alt="" />`;
const stones = `<span class="stones">
  <span class="stone past"></span><span class="stone past"></span><span class="stone today"></span>
  <span class="stone"></span><span class="stone"></span><span class="stone"></span><span class="stone"></span></span>`;
const hud = `<div class="hud"><span class="wallet">&#11088; 12</span>${stones}
  <span class="doors"><button class="btn btn-door">Store</button><button class="btn btn-door">Switch</button></span></div>`;

/* ---------- shared beat fragments ---------- */
function slab(c, cls = "", stamp = "ghost") {
  return `<div class="slab ${cls} ${c.sketch ? "sketch" : ""}">
    <span class="stamp ${stamp}">${STAR}</span>
    ${c.sketch ? '<span class="pencil">' + PENCIL + '</span>' : ""}
    <img class="art" src="${c.img}" alt="" />
    <div class="tag"><div class="t">${c.t}</div>${c.d ? `<div class="d">${c.d}</div>` : ""}</div>
  </div>`;
}
const undoBeat = `<div class="screen" data-screen="undo">${sky}${brand}
  <div class="center-stage">
    <img class="hero" src="${CARDS.snack.img}" alt="" />
    <h1 class="title-screen">${CARDS.snack.t}</h1>
    <div class="facts">Marked done &middot; +2 stars</div>
    <div class="actions"><button class="btn btn-door focused">Take the star back</button></div>
    <div class="calm small">Changed your mind? No fuss - you can take it back for a little while.</div>
  </div></div>`;
function endCard(c, hollow) {
  return `<div class="ending ${hollow ? "hollow" : "glow-gold"}">
    <div class="beat-card"><span class="stamp ${hollow ? "ghost" : "won"}">${STAR}</span>
      <img class="art" src="${c.img}" alt="" /><div class="tag">${c.t}</div></div>
    <div class="end-label">${hollow ? "If a day runs out" : "When a card grows up"}</div>
    <div class="calm small">${hollow
      ? "The drawing fades to pencil. It can visit again later - nothing is lost."
      : "All three stars! The card floats up as a golden memory and something new begins."}</div>
  </div>`;
}
const endingsBeat = `<div class="screen" data-screen="endings">${sky}${brand}
  <h1 class="title-end">Two ways a card can leave the shelf</h1>
  <div class="endings-wrap">${endCard(CARDS.water, true)}<div class="ending-divider"></div>${endCard(CARDS.retell, false)}</div></div>`;
function redeemBeat(kind) {
  const inner = {
    "redeem-confirm": `<h1 class="title-screen">A cape for your friend</h1>
      <div class="facts">Costs 30 &#11088; &middot; You'll have 12 &#11088; left</div>
      <div class="actions"><button class="btn btn-primary focused">Get it</button><button class="btn btn-door">Not yet</button></div>`,
    "redeem-reserved": `<h1 class="title-screen">A cape for your friend</h1>
      <div class="facts">Reserved! Amma gets a message.</div>
      <div class="calm small">When she says yes, it's on. Your stars wait right here.</div>
      <div class="actions"><button class="btn btn-door focused">Okay</button></div>`,
    "redeem-fulfilled": `<h1 class="title-screen">A cape for your friend</h1>
      <div class="facts">It's on! Amma said yes.</div>
      <div class="calm small">Wallet: 12 &#11088; &middot; The cape is coming.</div>
      <div class="actions"><button class="btn btn-door focused">Back to my shelf</button></div>`,
  }[kind];
  return `<div class="screen" data-screen="redeem">${sky}${brand}
    <div class="center-stage"><img class="hero" src="${A}/design/face-mira.png" alt="" />${inner}</div></div>`;
}
function parentBeat(kind) {
  const frames = {
    "parent-create": `<div class="bub nila">Here's the card I made for Ms. S - "At the shop, order your own snack all by yourself."<div class="receipt-s">From what you told me: she asked for a big-kid job at the shop.</div></div>
      <div class="bub nila"><img class="p-art" src="${CARDS.snack.img}" alt="" /></div>
      <div class="bub me">Yes - this is exactly the kind of thing she loves.</div>
      <div class="bub nila">Lovely. On her shelf tomorrow morning. 2 stars, she can do it alone.<div class="receipt-s">Preview OK'd &middot; 9:04 PM</div></div>`,
    "parent-fulfill": `<div class="bub nila">Ms. S wants to use 30 stars for "A cape for your friend."<div class="receipt-s">She has 42. If you say yes, she'll have 12 left.</div></div>
      <div class="p-actions"><span class="p-btn primary">Yes, it's on</span><span class="p-btn">Not now</span></div>`,
    "parent-digest": `<div class="bub nila"><span class="receipt-t">Tonight in two lines</span><div class="receipt-s" style="margin-top:8px">Mr. A: opened Nila, finished 1 card - "Pop-Up Toast!" (+1 &#11088;)<br/><br/>Ms. S: 3 opens, finished 1 - "At the shop, order your own snack." (+2 &#11088;)<br/><br/>Nothing asked, nothing pending. Night!</div></div>`,
    "parent-review": `<div class="bub nila">Ms. S marked "Drink 1 l water" done.<div class="receipt-s">Quick look? Your call - trust by default.</div></div>
      <div class="bub nila"><img class="p-art" src="${CARDS.water.img}" alt="" /></div>
      <div class="p-actions"><span class="p-btn primary">Looks done</span><span class="p-btn">Ask her about it</span></div>`,
  };
  return `<div class="screen parent-frame" data-screen="${kind}">
    <div class="p-head"><img src="${A}/characters/elephant-stand.png" alt="" /></div>
    <div class="p-thread">${frames[kind]}</div>
    <div class="p-composer"><span class="field">Message Nila...</span><span class="send">Send</span></div></div>`;
}

/* ---------- DIRECTION A: CLAY ROOM (merged ui-spec v1) ---------- */
const clay = {
  picker: `<div class="screen" data-screen="picker">${sky}${brand}
    <h1 class="title-screen">Who's here?</h1>
    <div class="picker-ground"></div>
    <div class="picker-kids">
      <div class="kidbtn focus"><div class="pebble"><img src="${A}/characters/faces/mr-a.png" alt="Mr. A" /></div><div class="nametag">Mr. A</div></div>
      <div class="kidbtn recess"><div class="pebble"><img src="${A}/characters/faces/ms-s.png" alt="Ms. S" /></div><div class="nametag">Ms. S</div></div>
    </div></div>`,
  shelf: `<div class="screen" data-screen="shelf">${sky}${brand}
    <h1 class="title-shelf">Ms. S's day</h1>${hud}
    <div class="ledge"></div>
    <div class="carousel">
      ${slab(CARDS.retell, "", "won")}
      ${slab(CARDS.snack, "focus")}
      ${slab(CARDS.notice)}
      ${slab(CARDS.water)}
      <div class="slab peek"><span class="stamp ghost">${STAR}</span><img class="art" src="${CARDS.explore.img}" alt="" /><div class="tag"><div class="t">${CARDS.explore.t}</div></div></div>
    </div></div>`,
  detail: `<div class="screen" data-screen="detail">${sky}${brand}
    <div class="center-stage">
      <img class="hero" src="${CARDS.snack.img}" alt="" />
      <h1 class="title-screen">${CARDS.snack.t}</h1>
      <div class="facts">2 stars &middot; You can do this one alone &middot; Go 1 of 1</div>
      <div class="actions"><button class="btn btn-primary focused">I did it!</button><button class="btn btn-outline">Try the bigger one</button></div>
    </div></div>`,
  quiz: `<div class="screen" data-screen="quiz">${sky}${brand}
    <div class="center-stage">
      <h1 class="title-screen">Which one is the biggest animal?</h1>
      <div class="facts">Quiz for Ms. S &middot; 1 star</div>
      <div class="quiz-grid">
        <button class="btn btn-door quiz">A cat</button>
        <button class="btn btn-door quiz focused">An elephant</button>
        <button class="btn btn-door quiz">A mouse</button>
        <button class="btn btn-door quiz">A butterfly</button>
      </div>
    </div></div>`,
  celebration: `<div class="screen" data-screen="celebration">
    <img class="cele-bg" src="${A}/moments/celebration.png" alt="" />
    <div class="cele-tintlayer"></div>
    <div class="cele-overlay"></div>
    <div class="cele-stamp">${STAR}</div>
    <div class="cele-lower">
      <h1 class="title-screen">You did it!</h1>
      <div class="cele-stars">+2 &#11088;</div>
      <div class="calm">Wallet: 12 &#11088; &middot; Your snack-ordering was all you.</div>
    </div></div>`,
  store: `<div class="screen" data-screen="store">${sky}${brand}
    <h1 class="title-screen">Store</h1>
    <div class="wallet-line">You have 42 &#11088;</div>
    <div class="store-grid">
      <div class="item focused"><img src="${A}/design/face-mira.png" alt="" /><div class="t">A cape for your friend</div><div class="p">30 &#11088;</div></div>
      <div class="item"><img src="${CARDS.snack2.img}" alt="" /><div class="t">Movie night</div><div class="p">60 &#11088; &middot; 18 more stars</div></div>
      <div class="item"><img src="${CARDS.dream.img}" alt="" /><div class="t">Stay up 15 minutes late</div><div class="p">30 &#11088;</div></div>
      <div class="item locked"><img src="${CARDS.fort.img}" alt="" /><div class="t">A trip to the bookshop</div><div class="p">160 &#11088;</div></div>
    </div>
    <div class="comeback"><span class="cb-art">&#11088;</span> The kite card comes back soon - it's being painted again.</div>
    <div class="store-back"><button class="btn btn-door">Back</button></div></div>`,
};

/* ---------- DIRECTION B: STORYBOOK ---------- */
function pageTab(c, state, cls = "") {
  return `<div class="pagetab ${cls} ${state}">${state === "won" ? `<span class="mini-star">${STAR}</span>` : ""}${state === "sketch" ? `<span class="mini-pencil">${PENCIL}</span>` : ""}<img src="${c.img}" alt="" /></div>`;
}
const storybook = {
  picker: `<div class="screen" data-screen="picker">${sky}${brand}
    <div class="bookcover">
      <h1 class="title-screen">Who's here?</h1>
      <div class="cover-plates">
        <div class="plate focus"><img src="${A}/characters/faces/mr-a.png" alt="Mr. A" /><div class="plate-name">Mr. A</div></div>
        <div class="plate recess"><img src="${A}/characters/faces/ms-s.png" alt="Ms. S" /><div class="plate-name">Ms. S</div></div>
      </div>
    </div></div>`,
  shelf: `<div class="screen" data-screen="shelf">${sky}${brand}
    <h1 class="title-shelf">Ms. S's day</h1>${hud}
    <div class="book">
      <div class="page left"><img class="pageart" src="${CARDS.snack.img}" alt="" /><div class="deckle"></div></div>
      <div class="gutter"></div>
      <div class="page right">
        <span class="postmark">${STAR}</span>
        <div class="p-title">${CARDS.snack.t}</div>
        <div class="p-desc">${CARDS.snack.d}</div>
        <div class="p-meta">2 stars &middot; You can do this one alone</div>
        <button class="btn btn-primary focused">I did it!</button>
      </div>
    </div>
    <div class="pageindex">
      ${pageTab(CARDS.retell, "won")}
      ${pageTab(CARDS.snack, "now", "current")}
      ${pageTab(CARDS.notice, "plain")}
      ${pageTab(CARDS.water, "sketch")}
      ${pageTab(CARDS.explore, "plain", "peektab")}
    </div></div>`,
  detail: `<div class="screen" data-screen="detail">${sky}${brand}
    <div class="singlepage">
      <img class="sp-art" src="${CARDS.snack.img}" alt="" />
      <div class="p-title">${CARDS.snack.t}</div>
      <div class="p-meta">2 stars &middot; You can do this one alone &middot; Go 1 of 1</div>
      <div class="actions"><button class="btn btn-primary focused">I did it!</button><button class="btn btn-outline">Try the bigger one</button></div>
    </div></div>`,
  quiz: `<div class="screen" data-screen="quiz">${sky}${brand}
    <div class="singlepage quizpage">
      <h1 class="title-screen">Which one is the biggest animal?</h1>
      <div class="facts">Quiz for Ms. S &middot; 1 star</div>
      <div class="ribbons">
        <button class="ribbon">A cat</button>
        <button class="ribbon focused">An elephant</button>
        <button class="ribbon">A mouse</button>
      </div>
    </div></div>`,
  celebration: `<div class="screen" data-screen="celebration">
    <img class="cele-bg" src="${A}/moments/celebration.png" alt="" />
    <div class="cele-tintlayer"></div>
    <div class="cele-overlay"></div>
    <div class="cele-stamp">${STAR}</div>
    <div class="cele-lower">
      <h1 class="title-screen">You did it!</h1>
      <div class="cele-stars">+2 &#11088;</div>
      <div class="calm">Wallet: 12 &#11088; &middot; Your snack-ordering was all you.</div>
    </div></div>`,
  store: `<div class="screen" data-screen="store">${sky}${brand}
    <div class="book storebook">
      <div class="page left storeleft">
        <h1 class="title-shelf">Nila's store</h1>
        <div class="wallet-line">You have 42 &#11088;</div>
        <div class="comeback"><span class="cb-art">&#11088;</span> The kite card comes back soon - it's being painted again.</div>
        <button class="btn btn-door">Back</button>
      </div>
      <div class="gutter"></div>
      <div class="page right catalog">
        <div class="cat focused"><img src="${A}/design/face-mira.png" alt="" /><div class="t">A cape for your friend</div><div class="p">30 &#11088;</div></div>
        <div class="cat"><img src="${CARDS.snack2.img}" alt="" /><div class="t">Movie night</div><div class="p">60 &#11088; &middot; 18 more stars</div></div>
        <div class="cat"><img src="${CARDS.dream.img}" alt="" /><div class="t">Stay up 15 minutes late</div><div class="p">30 &#11088;</div></div>
        <div class="cat locked"><img src="${CARDS.fort.img}" alt="" /><div class="t">A trip to the bookshop</div><div class="p">160 &#11088;</div></div>
      </div>
    </div></div>`,
};

/* ---------- DIRECTION C: LANTERN TRAIL ---------- */
function lantern(c, cls = "", state = "ghost") {
  return `<div class="lantern ${cls} ${c.sketch ? "unlit" : ""}">
    <div class="lstring"></div>
    <span class="lstar ${state}">${STAR}</span>
    <div class="lframe"><img class="blur" src="${c.img}" alt="" /><img class="sharp" src="${c.img}" alt="" /></div>
    <div class="ltag">${c.t}</div>
    ${c.sketch ? `<span class="lpencil">${PENCIL}</span>` : ""}
  </div>`;
}
const lanternT = {
  picker: `<div class="screen" data-screen="picker">${sky}${brand}
    <h1 class="title-screen">Who's here?</h1>
    <div class="hang-row">
      <div class="biglantern focus"><div class="lstring"></div><div class="lframe"><img src="${A}/characters/faces/mr-a.png" alt="Mr. A" /></div><div class="ltag">Mr. A</div></div>
      <div class="biglantern recess"><div class="lstring"></div><div class="lframe"><img src="${A}/characters/faces/ms-s.png" alt="Ms. S" /></div><div class="ltag">Ms. S</div></div>
    </div></div>`,
  shelf: `<div class="screen" data-screen="shelf">${sky}${brand}
    <h1 class="title-shelf">Ms. S's day</h1>${hud}
    <div class="trailline"></div>
    <div class="lantern-row">
      ${lantern(CARDS.retell, "", "won")}
      ${lantern(CARDS.snack, "focus", "ghost")}
      ${lantern(CARDS.notice)}
      ${lantern(CARDS.water)}
      ${lantern(CARDS.explore, "peek")}
    </div></div>`,
  detail: `<div class="screen" data-screen="detail">${sky}${brand}
    <div class="center-stage">
      <div class="biglantern jumbo"><div class="lstring"></div><div class="lframe"><img src="${CARDS.snack.img}" alt="" /></div></div>
      <h1 class="title-screen">${CARDS.snack.t}</h1>
      <div class="facts">2 stars &middot; You can do this one alone &middot; Go 1 of 1</div>
      <div class="actions"><button class="btn btn-primary focused">I did it!</button><button class="btn btn-outline">Try the bigger one</button></div>
    </div></div>`,
  quiz: `<div class="screen" data-screen="quiz">${sky}${brand}
    <div class="center-stage">
      <h1 class="title-screen">Which one is the biggest animal?</h1>
      <div class="facts">Quiz for Ms. S &middot; 1 star</div>
      <div class="hang-row answers">
        <button class="btn btn-door lant-answer">A cat</button>
        <button class="btn btn-door lant-answer focused">An elephant</button>
        <button class="btn btn-door lant-answer">A mouse</button>
      </div>
    </div></div>`,
  celebration: `<div class="screen" data-screen="celebration">
    <img class="cele-bg" src="${A}/moments/celebration.png" alt="" />
    <div class="cele-tintlayer"></div>
    <div class="cele-overlay"></div>
    <div class="cele-stamp">${STAR}</div>
    <div class="cele-lower">
      <h1 class="title-screen">You did it!</h1>
      <div class="cele-stars">+2 &#11088;</div>
      <div class="calm">Wallet: 12 &#11088; &middot; Your snack-ordering was all you.</div>
    </div></div>`,
  store: `<div class="screen" data-screen="store">${sky}${brand}
    <h1 class="title-screen">Store</h1>
    <div class="wallet-line">You have 42 &#11088;</div>
    <div class="stall-line"></div>
    <div class="stall">
      <div class="stallitem focused"><div class="lstring"></div><div class="sframe"><img src="${A}/design/face-mira.png" alt="" /></div><div class="t">A cape for your friend</div><div class="p">30 &#11088;</div></div>
      <div class="stallitem"><div class="lstring"></div><div class="sframe"><img src="${CARDS.snack2.img}" alt="" /></div><div class="t">Movie night</div><div class="p">60 &#11088; &middot; 18 more stars</div></div>
      <div class="stallitem"><div class="lstring"></div><div class="sframe"><img src="${CARDS.dream.img}" alt="" /></div><div class="t">Stay up 15 minutes late</div><div class="p">30 &#11088;</div></div>
      <div class="stallitem locked"><div class="lstring"></div><div class="sframe"><img src="${CARDS.fort.img}" alt="" /></div><div class="t">A trip to the bookshop</div><div class="p">160 &#11088;</div></div>
    </div>
    <div class="comeback"><span class="cb-art">&#11088;</span> The kite card comes back soon - it's being painted again.</div>
    <div class="store-back"><button class="btn btn-door">Back</button></div></div>`,
};

/* ---------- DIRECTION D: BLOCK TOWER ---------- */
function block(c, cls = "", state = "ghost") {
  return `<div class="blk ${cls} ${c.sketch ? "hollowblock" : ""}">
    <img class="bface" src="${c.img}" alt="" />
    <div class="btitle">${c.t}</div>
    <span class="bstud ${state}">${STAR}</span>
    ${c.sketch ? `<span class="bpencil">${PENCIL}</span>` : ""}
  </div>`;
}
const blocks = {
  picker: `<div class="screen" data-screen="picker">${sky}${brand}
    <h1 class="title-screen">Who's here?</h1>
    <div class="baseplate pickerplate"></div>
    <div class="cube-row">
      <div class="cube focus"><img src="${A}/characters/faces/mr-a.png" alt="Mr. A" /><div class="cubename">Mr. A</div></div>
      <div class="cube recess"><img src="${A}/characters/faces/ms-s.png" alt="Ms. S" /><div class="cubename">Ms. S</div></div>
    </div></div>`,
  shelf: `<div class="screen" data-screen="shelf">${sky}${brand}
    <div class="tower-head"><h1 class="title-shelf">Ms. S's day</h1>${hud}</div>
    <div class="baseplate shelfplate"></div>
    <div class="blockrow">
      ${block(CARDS.retell, "", "won")}
      ${block(CARDS.snack, "focus", "ghost")}
      ${block(CARDS.notice)}
      ${block(CARDS.water)}
      ${block(CARDS.explore, "peekblock")}
    </div></div>`,
  detail: `<div class="screen" data-screen="detail">${sky}${brand}
    <div class="center-stage">
      <div class="blk jumboblock"><img class="bface" src="${CARDS.snack.img}" alt="" /><div class="btitle">${CARDS.snack.t}</div></div>
      <div class="facts">2 stars &middot; You can do this one alone &middot; Go 1 of 1</div>
      <div class="actions"><button class="btn btn-primary focused">I did it!</button><button class="btn btn-outline">Try the bigger one</button></div>
    </div></div>`,
  quiz: `<div class="screen" data-screen="quiz">${sky}${brand}
    <div class="center-stage">
      <h1 class="title-screen">Which one is the biggest animal?</h1>
      <div class="facts">Quiz for Ms. S &middot; 1 star</div>
      <div class="block-answers">
        <button class="btn btn-door blockanswer">A cat</button>
        <button class="btn btn-door blockanswer focused">An elephant</button>
        <button class="btn btn-door blockanswer">A mouse</button>
      </div>
    </div></div>`,
  celebration: `<div class="screen" data-screen="celebration">
    <img class="cele-bg" src="${A}/moments/celebration.png" alt="" />
    <div class="cele-tintlayer"></div>
    <div class="cele-overlay"></div>
    <div class="cele-stamp">${STAR}</div>
    <div class="cele-lower">
      <h1 class="title-screen">You did it!</h1>
      <div class="cele-stars">+2 &#11088;</div>
      <div class="calm">Wallet: 12 &#11088; &middot; Your snack-ordering was all you.</div>
    </div></div>`,
  store: `<div class="screen" data-screen="store">${sky}${brand}
    <h1 class="title-screen">Store</h1>
    <div class="wallet-line">You have 42 &#11088;</div>
    <div class="bin">
      <div class="binitem focused"><img src="${A}/design/face-mira.png" alt="" /><div class="t">A cape for your friend</div><div class="p">30 &#11088;</div></div>
      <div class="binitem"><img src="${CARDS.snack2.img}" alt="" /><div class="t">Movie night</div><div class="p">60 &#11088; &middot; 18 more stars</div></div>
      <div class="binitem"><img src="${CARDS.dream.img}" alt="" /><div class="t">Stay up 15 minutes late</div><div class="p">30 &#11088;</div></div>
      <div class="binitem locked"><img src="${CARDS.fort.img}" alt="" /><div class="t">A trip to the bookshop</div><div class="p">160 &#11088;</div></div>
    </div>
    <div class="comeback"><span class="cb-art">&#11088;</span> The kite card comes back soon - it's being painted again.</div>
    <div class="store-back"><button class="btn btn-door">Back</button></div></div>`,
};

/* ---------- DIRECTION E: GARDEN TERRARIUM ---------- */
function plant(c, cls = "", state = "ghost") {
  return `<div class="plant ${cls}">
    ${state === "won" ? `<span class="firefly">${STAR}</span>` : ""}
    ${c.sketch
      ? `<div class="seedpacket"><span>${PENCIL}</span><div class="seed-t">Nila is painting</div></div><div class="sprout"></div>`
      : `<div class="bloom"><img class="blur" src="${c.img}" alt="" /><img class="sharp" src="${c.img}" alt="" /></div>`}
    <div class="stem"></div>
    <div class="pot"><div class="pot-t">${c.t}</div></div>
  </div>`;
}
const garden = {
  picker: `<div class="screen" data-screen="picker">${sky}${brand}
    <h1 class="title-screen">Who's here?</h1>
    <div class="bed pickerbed"></div>
    <div class="plants pickerplants">
      <div class="plant focus"><div class="bloom facebloom"><img src="${A}/characters/faces/mr-a.png" alt="Mr. A" /></div><div class="stem"></div><div class="pot"><div class="pot-t">Mr. A</div></div></div>
      <div class="plant recess"><div class="bloom facebloom"><img src="${A}/characters/faces/ms-s.png" alt="Ms. S" /></div><div class="stem"></div><div class="pot"><div class="pot-t">Ms. S</div></div></div>
    </div></div>`,
  shelf: `<div class="screen" data-screen="shelf">${sky}${brand}
    <h1 class="title-shelf">Ms. S's day</h1>${hud}
    <div class="bed"></div>
    <div class="plants">
      ${plant(CARDS.retell, "", "won")}
      ${plant(CARDS.snack, "focus")}
      ${plant(CARDS.notice)}
      ${plant(CARDS.water)}
      ${plant(CARDS.explore, "peekplant")}
    </div></div>`,
  detail: `<div class="screen" data-screen="detail">${sky}${brand}
    <div class="center-stage">
      <div class="bloom jumbobloom"><img src="${CARDS.snack.img}" alt="" /></div>
      <h1 class="title-screen">${CARDS.snack.t}</h1>
      <div class="facts">2 stars &middot; You can do this one alone &middot; Go 1 of 1</div>
      <div class="actions"><button class="btn btn-primary focused">I did it!</button><button class="btn btn-outline">Try the bigger one</button></div>
    </div></div>`,
  quiz: `<div class="screen" data-screen="quiz">${sky}${brand}
    <div class="center-stage">
      <h1 class="title-screen">Which one is the biggest animal?</h1>
      <div class="facts">Quiz for Ms. S &middot; 1 star</div>
      <div class="signposts">
        <button class="signpost">A cat</button>
        <button class="signpost focused">An elephant</button>
        <button class="signpost">A mouse</button>
      </div>
    </div></div>`,
  celebration: `<div class="screen" data-screen="celebration">
    <img class="cele-bg" src="${A}/moments/celebration.png" alt="" />
    <div class="cele-tintlayer"></div>
    <div class="cele-overlay"></div>
    <div class="cele-stamp">${STAR}</div>
    <div class="cele-lower">
      <h1 class="title-screen">You did it!</h1>
      <div class="cele-stars">+2 &#11088;</div>
      <div class="calm">Wallet: 12 &#11088; &middot; Your snack-ordering was all you.</div>
    </div></div>`,
  store: `<div class="screen" data-screen="store">${sky}${brand}
    <h1 class="title-screen">Store</h1>
    <div class="wallet-line">You have 42 &#11088;</div>
    <div class="seedrow">
      <div class="packet focused"><img src="${A}/design/face-mira.png" alt="" /><div class="t">A cape for your friend</div><div class="p">30 &#11088;</div></div>
      <div class="packet"><img src="${CARDS.snack2.img}" alt="" /><div class="t">Movie night</div><div class="p">60 &#11088; &middot; 18 more stars</div></div>
      <div class="packet"><img src="${CARDS.dream.img}" alt="" /><div class="t">Stay up 15 minutes late</div><div class="p">30 &#11088;</div></div>
      <div class="packet locked"><img src="${CARDS.fort.img}" alt="" /><div class="t">A trip to the bookshop</div><div class="p">160 &#11088;</div></div>
    </div>
    <div class="comeback"><span class="cb-art">&#11088;</span> The kite card comes back soon - it's being painted again.</div>
    <div class="store-back"><button class="btn btn-door">Back</button></div></div>`,
};

const THEMES = { clay, storybook, lantern: lanternT, blocks, garden };

/* ---------- BOOKSHELF (founder 2026-09-12: themed shelves, kid picks 3/week) ---------- */
function bsBook(c, cls = "") {
  const picked = cls.includes("picked");
  return `<div class="bs-book ${cls} ${c.sketch ? "sketch" : ""}">
    ${picked ? `<span class="bs-pick">${STAR}</span>` : ""}
    ${c.sketch ? `<span class="bs-pencil">${PENCIL}</span>` : ""}
    <img class="bs-art" src="${c.img}" alt="" />
    <div class="bs-title">${c.t}</div>
  </div>`;
}
const bookshelfBeat = `<div class="screen" data-screen="bookshelf">${sky}${brand}
  <h1 class="title-shelf">Ms. S's bookshelf</h1>${hud}
  <div class="bs-pickbar"><span class="bs-picklabel">Pick your 3 for the week</span>
    <span class="bs-slots"><span class="bs-slot filled">${STAR}</span><span class="bs-slot filled">${STAR}</span><span class="bs-slot empty">${STAR}</span></span>
    <span class="bs-pickhint">1 more to choose</span></div>
  <div class="bs-case">
    <div class="bs-row"><div class="bs-rowlabel">Fun &amp; Giggles</div>
      <div class="bs-books">${bsBook(CARDS.fort)}${bsBook(CARDS.snack2)}${bsBook(CARDS.dream)}<div class="bs-stack"><span></span><span></span><span></span></div></div><div class="bs-plank"></div></div>
    <div class="bs-row"><div class="bs-rowlabel">Friends &amp; Family</div>
      <div class="bs-books">${bsBook(CARDS.retell, "picked")}${bsBook(CARDS.notice)}<div class="bs-stack two"><span></span><span></span></div></div><div class="bs-plank"></div></div>
    <div class="bs-row"><div class="bs-rowlabel">Out &amp; About</div>
      <div class="bs-books">${bsBook(CARDS.explore)}${bsBook(CARDS.water)}${bsBook(CARDS.snack, "focus picked")}</div><div class="bs-plank"></div></div>
  </div></div>`;

const SHARED = { undo: undoBeat, endings: endingsBeat,
  "redeem-confirm": redeemBeat("redeem-confirm"), "redeem-reserved": redeemBeat("redeem-reserved"),
  "redeem-fulfilled": redeemBeat("redeem-fulfilled"),
  "parent-create": parentBeat("parent-create"), "parent-fulfill": parentBeat("parent-fulfill"),
  "parent-digest": parentBeat("parent-digest"), "parent-review": parentBeat("parent-review"), bookshelf: bookshelfBeat };

const q = new URLSearchParams(location.search);
const theme = q.get("theme") || "clay";
const screen = q.get("screen") || "shelf";
document.body.classList.add("theme-" + theme);
const tpl = THEMES[theme][screen] || SHARED[screen] || THEMES[theme].shelf;
document.body.innerHTML = tpl;
document.title = `Nila mock - ${theme} - ${screen}`;
