import{c as _,h as Y}from"./codemirror.es2.D1PI0zxW.js";import{K as q}from"./searchcursor.es2.ByzN8nxu.js";import{j as z}from"./matchbrackets.es2.DdFfS6_W.js";var G=Object.defineProperty,C=(e,t)=>G(e,"name",{value:t,configurable:!0});function j(e,t){for(var n=0;n<t.length;n++){const r=t[n];if("string"!=typeof r&&!Array.isArray(r))for(const t in r)if("default"!==t&&!(t in e)){const n=Object.getOwnPropertyDescriptor(r,t);n&&Object.defineProperty(e,t,n.get?n:{enumerable:!0,get:()=>r[t]})}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}C(j,"_mergeNamespaces");var J={exports:{}};!function(e){var t=e.commands,n=e.Pos;function r(t,r,o){if(o<0&&0==r.ch)return t.clipPos(n(r.line-1));var i=t.getLine(r.line);if(o>0&&r.ch>=i.length)return t.clipPos(n(r.line+1,0));for(var l,a="start",s=r.ch,c=s,f=o<0?0:i.length,u=0;c!=f;c+=o,u++){var d=i.charAt(o<0?c-1:c),m="_"!=d&&e.isWordChar(d)?"w":"o";if("w"==m&&d.toUpperCase()==d&&(m="W"),"start"==a)"o"!=m?(a="in",l=m):s=c+o;else if("in"==a&&l!=m){if("w"==l&&"W"==m&&o<0&&c--,"W"==l&&"w"==m&&o>0){if(c==s+1){l="w";continue}c--}break}}return n(r.line,c)}function o(e,t){e.extendSelectionsBy((function(n){return e.display.shift||e.doc.extend||n.empty()?r(e.doc,n.head,t):t<0?n.from():n.to()}))}function i(t,r){if(t.isReadOnly())return e.Pass;t.operation((function(){for(var e=t.listSelections().length,o=[],i=-1,l=0;l<e;l++){var a=t.listSelections()[l].head;if(!(a.line<=i)){var s=n(a.line+(r?0:1),0);t.replaceRange("\n",s,null,"+insertLine"),t.indentLine(s.line,null,!0),o.push({head:s,anchor:s}),i=a.line+1}}t.setSelections(o)})),t.execCommand("indentAuto")}function l(t,r){for(var o=r.ch,i=o,l=t.getLine(r.line);o&&e.isWordChar(l.charAt(o-1));)--o;for(;i<l.length&&e.isWordChar(l.charAt(i));)++i;return{from:n(r.line,o),to:n(r.line,i),word:l.slice(o,i)}}function a(e,t){for(var n=e.listSelections(),r=[],o=0;o<n.length;o++){var i=n[o],l=e.findPosV(i.anchor,t,"line",i.anchor.goalColumn),a=e.findPosV(i.head,t,"line",i.head.goalColumn);l.goalColumn=null!=i.anchor.goalColumn?i.anchor.goalColumn:e.cursorCoords(i.anchor,"div").left,a.goalColumn=null!=i.head.goalColumn?i.head.goalColumn:e.cursorCoords(i.head,"div").left;var s={anchor:l,head:a};r.push(i),r.push(s)}e.setSelections(r)}function s(t,n,r){for(var o=0;o<t.length;o++)if(0==e.cmpPos(t[o].from(),n)&&0==e.cmpPos(t[o].to(),r))return!0;return!1}C(r,"findPosSubword"),C(o,"moveSubword"),t.goSubwordLeft=function(e){o(e,-1)},t.goSubwordRight=function(e){o(e,1)},t.scrollLineUp=function(e){var t=e.getScrollInfo();if(!e.somethingSelected()){var n=e.lineAtHeight(t.top+t.clientHeight,"local");e.getCursor().line>=n&&e.execCommand("goLineUp")}e.scrollTo(null,t.top-e.defaultTextHeight())},t.scrollLineDown=function(e){var t=e.getScrollInfo();if(!e.somethingSelected()){var n=e.lineAtHeight(t.top,"local")+1;e.getCursor().line<=n&&e.execCommand("goLineDown")}e.scrollTo(null,t.top+e.defaultTextHeight())},t.splitSelectionByLine=function(e){for(var t=e.listSelections(),r=[],o=0;o<t.length;o++)for(var i=t[o].from(),l=t[o].to(),a=i.line;a<=l.line;++a)l.line>i.line&&a==l.line&&0==l.ch||r.push({anchor:a==i.line?i:n(a,0),head:a==l.line?l:n(a)});e.setSelections(r,0)},t.singleSelectionTop=function(e){var t=e.listSelections()[0];e.setSelection(t.anchor,t.head,{scroll:!1})},t.selectLine=function(e){for(var t=e.listSelections(),r=[],o=0;o<t.length;o++){var i=t[o];r.push({anchor:n(i.from().line,0),head:n(i.to().line+1,0)})}e.setSelections(r)},C(i,"insertLine"),t.insertLineAfter=function(e){return i(e,!1)},t.insertLineBefore=function(e){return i(e,!0)},C(l,"wordAt"),t.selectNextOccurrence=function(t){var r=t.getCursor("from"),o=t.getCursor("to"),i=t.state.sublimeFindFullWord==t.doc.sel;if(0==e.cmpPos(r,o)){var a=l(t,r);if(!a.word)return;t.setSelection(a.from,a.to),i=!0}else{var c=t.getRange(r,o),f=i?new RegExp("\\b"+c+"\\b"):c,u=t.getSearchCursor(f,o),d=u.findNext();if(d||(d=(u=t.getSearchCursor(f,n(t.firstLine(),0))).findNext()),!d||s(t.listSelections(),u.from(),u.to()))return;t.addSelection(u.from(),u.to())}i&&(t.state.sublimeFindFullWord=t.doc.sel)},t.skipAndSelectNextOccurrence=function(n){var r=n.getCursor("anchor"),o=n.getCursor("head");t.selectNextOccurrence(n),0!=e.cmpPos(r,o)&&n.doc.setSelections(n.doc.listSelections().filter((function(e){return e.anchor!=r||e.head!=o})))},C(a,"addCursorToSelection"),t.addCursorToPrevLine=function(e){a(e,-1)},t.addCursorToNextLine=function(e){a(e,1)},C(s,"isSelectedRange");var c="(){}[]";function f(t){for(var r=t.listSelections(),o=[],i=0;i<r.length;i++){var l=r[i],a=l.head,s=t.scanForBracket(a,-1);if(!s)return!1;for(;;){var f=t.scanForBracket(a,1);if(!f)return!1;if(f.ch==c.charAt(c.indexOf(s.ch)+1)){var u=n(s.pos.line,s.pos.ch+1);if(0!=e.cmpPos(u,l.from())||0!=e.cmpPos(f.pos,l.to())){o.push({anchor:u,head:f.pos});break}if(!(s=t.scanForBracket(s.pos,-1)))return!1}a=n(f.pos.line,f.pos.ch+1)}}return t.setSelections(o),!0}function u(e){return e?/\bpunctuation\b/.test(e)?e:void 0:null}function d(t,r,o){if(t.isReadOnly())return e.Pass;for(var i,l=t.listSelections(),a=[],s=0;s<l.length;s++){var c=l[s];if(!c.empty()){for(var f=c.from().line,u=c.to().line;s<l.length-1&&l[s+1].from().line==u;)u=l[++s].to().line;l[s].to().ch||u--,a.push(f,u)}}a.length?i=!0:a.push(t.firstLine(),t.lastLine()),t.operation((function(){for(var e=[],l=0;l<a.length;l+=2){var s=a[l],c=a[l+1],f=n(s,0),u=n(c),d=t.getRange(f,u,!1);r?d.sort((function(e,t){return e<t?-o:e==t?0:o})):d.sort((function(e,t){var n=e.toUpperCase(),r=t.toUpperCase();return n!=r&&(e=n,t=r),e<t?-o:e==t?0:o})),t.replaceRange(d,f,u),i&&e.push({anchor:f,head:n(c+1,0)})}i&&t.setSelections(e,0)}))}function m(t,n){t.operation((function(){for(var r=t.listSelections(),o=[],i=[],a=0;a<r.length;a++)(c=r[a]).empty()?(o.push(a),i.push("")):i.push(n(t.getRange(c.from(),c.to())));var s;for(t.replaceSelections(i,"around","case"),a=o.length-1;a>=0;a--){var c=r[o[a]];if(!(s&&e.cmpPos(c.head,s)>0)){var f=l(t,c.head);s=f.from,t.replaceRange(n(f.word),f.from,f.to)}}}))}function h(t){var n=t.getCursor("from"),r=t.getCursor("to");if(0==e.cmpPos(n,r)){var o=l(t,n);if(!o.word)return;n=o.from,r=o.to}return{from:n,to:r,query:t.getRange(n,r),word:o}}function p(e,t){var r=h(e);if(r){var o=r.query,i=e.getSearchCursor(o,t?r.to:r.from);(t?i.findNext():i.findPrevious())?e.setSelection(i.from(),i.to()):(i=e.getSearchCursor(o,t?n(e.firstLine(),0):e.clipPos(n(e.lastLine()))),(t?i.findNext():i.findPrevious())?e.setSelection(i.from(),i.to()):r.word&&e.setSelection(r.from,r.to))}}C(f,"selectBetweenBrackets"),t.selectScope=function(e){f(e)||e.execCommand("selectAll")},t.selectBetweenBrackets=function(t){if(!f(t))return e.Pass},C(u,"puncType"),t.goToBracket=function(t){t.extendSelectionsBy((function(r){var o=t.scanForBracket(r.head,1,u(t.getTokenTypeAt(r.head)));if(o&&0!=e.cmpPos(o.pos,r.head))return o.pos;var i=t.scanForBracket(r.head,-1,u(t.getTokenTypeAt(n(r.head.line,r.head.ch+1))));return i&&n(i.pos.line,i.pos.ch+1)||r.head}))},t.swapLineUp=function(t){if(t.isReadOnly())return e.Pass;for(var r=t.listSelections(),o=[],i=t.firstLine()-1,l=[],a=0;a<r.length;a++){var s=r[a],c=s.from().line-1,f=s.to().line;l.push({anchor:n(s.anchor.line-1,s.anchor.ch),head:n(s.head.line-1,s.head.ch)}),0==s.to().ch&&!s.empty()&&--f,c>i?o.push(c,f):o.length&&(o[o.length-1]=f),i=f}t.operation((function(){for(var e=0;e<o.length;e+=2){var r=o[e],i=o[e+1],a=t.getLine(r);t.replaceRange("",n(r,0),n(r+1,0),"+swapLine"),i>t.lastLine()?t.replaceRange("\n"+a,n(t.lastLine()),null,"+swapLine"):t.replaceRange(a+"\n",n(i,0),null,"+swapLine")}t.setSelections(l),t.scrollIntoView()}))},t.swapLineDown=function(t){if(t.isReadOnly())return e.Pass;for(var r=t.listSelections(),o=[],i=t.lastLine()+1,l=r.length-1;l>=0;l--){var a=r[l],s=a.to().line+1,c=a.from().line;0==a.to().ch&&!a.empty()&&s--,s<i?o.push(s,c):o.length&&(o[o.length-1]=c),i=c}t.operation((function(){for(var e=o.length-2;e>=0;e-=2){var r=o[e],i=o[e+1],l=t.getLine(r);r==t.lastLine()?t.replaceRange("",n(r-1),n(r),"+swapLine"):t.replaceRange("",n(r,0),n(r+1,0),"+swapLine"),t.replaceRange(l+"\n",n(i,0),null,"+swapLine")}t.scrollIntoView()}))},t.toggleCommentIndented=function(e){e.toggleComment({indent:!0})},t.joinLines=function(e){for(var t=e.listSelections(),r=[],o=0;o<t.length;o++){for(var i=t[o],l=i.from(),a=l.line,s=i.to().line;o<t.length-1&&t[o+1].from().line==s;)s=t[++o].to().line;r.push({start:a,end:s,anchor:!i.empty()&&l})}e.operation((function(){for(var t=0,o=[],i=0;i<r.length;i++){for(var l,a=r[i],s=a.anchor&&n(a.anchor.line-t,a.anchor.ch),c=a.start;c<=a.end;c++){var f=c-t;c==a.end&&(l=n(f,e.getLine(f).length+1)),f<e.lastLine()&&(e.replaceRange(" ",n(f),n(f+1,/^\s*/.exec(e.getLine(f+1))[0].length)),++t)}o.push({anchor:s||l,head:l})}e.setSelections(o,0)}))},t.duplicateLine=function(e){e.operation((function(){for(var t=e.listSelections().length,r=0;r<t;r++){var o=e.listSelections()[r];o.empty()?e.replaceRange(e.getLine(o.head.line)+"\n",n(o.head.line,0)):e.replaceRange(e.getRange(o.from(),o.to()),o.from())}e.scrollIntoView()}))},C(d,"sortLines"),t.sortLines=function(e){d(e,!0,1)},t.reverseSortLines=function(e){d(e,!0,-1)},t.sortLinesInsensitive=function(e){d(e,!1,1)},t.reverseSortLinesInsensitive=function(e){d(e,!1,-1)},t.nextBookmark=function(e){var t=e.state.sublimeBookmarks;if(t)for(;t.length;){var n=t.shift(),r=n.find();if(r)return t.push(n),e.setSelection(r.from,r.to)}},t.prevBookmark=function(e){var t=e.state.sublimeBookmarks;if(t)for(;t.length;){t.unshift(t.pop());var n=t[t.length-1].find();if(n)return e.setSelection(n.from,n.to);t.pop()}},t.toggleBookmark=function(e){for(var t=e.listSelections(),n=e.state.sublimeBookmarks||(e.state.sublimeBookmarks=[]),r=0;r<t.length;r++){for(var o=t[r].from(),i=t[r].to(),l=t[r].empty()?e.findMarksAt(o):e.findMarks(o,i),a=0;a<l.length;a++)if(l[a].sublimeBookmark){l[a].clear();for(var s=0;s<n.length;s++)n[s]==l[a]&&n.splice(s--,1);break}a==l.length&&n.push(e.markText(o,i,{sublimeBookmark:!0,clearWhenEmpty:!1}))}},t.clearBookmarks=function(e){var t=e.state.sublimeBookmarks;if(t)for(var n=0;n<t.length;n++)t[n].clear();t.length=0},t.selectBookmarks=function(e){var t=e.state.sublimeBookmarks,n=[];if(t)for(var r=0;r<t.length;r++){var o=t[r].find();o?n.push({anchor:o.from,head:o.to}):t.splice(r--,0)}n.length&&e.setSelections(n,0)},C(m,"modifyWordOrSelection"),t.smartBackspace=function(t){if(t.somethingSelected())return e.Pass;t.operation((function(){for(var r=t.listSelections(),o=t.getOption("indentUnit"),i=r.length-1;i>=0;i--){var l=r[i].head,a=t.getRange({line:l.line,ch:0},l),s=e.countColumn(a,null,t.getOption("tabSize")),c=t.findPosH(l,-1,"char",!1);if(a&&!/\S/.test(a)&&s%o==0){var f=new n(l.line,e.findColumn(a,s-o,o));f.ch!=l.ch&&(c=f)}t.replaceRange("",c,l,"+delete")}}))},t.delLineRight=function(e){e.operation((function(){for(var t=e.listSelections(),r=t.length-1;r>=0;r--)e.replaceRange("",t[r].anchor,n(t[r].to().line),"+delete");e.scrollIntoView()}))},t.upcaseAtCursor=function(e){m(e,(function(e){return e.toUpperCase()}))},t.downcaseAtCursor=function(e){m(e,(function(e){return e.toLowerCase()}))},t.setSublimeMark=function(e){e.state.sublimeMark&&e.state.sublimeMark.clear(),e.state.sublimeMark=e.setBookmark(e.getCursor())},t.selectToSublimeMark=function(e){var t=e.state.sublimeMark&&e.state.sublimeMark.find();t&&e.setSelection(e.getCursor(),t)},t.deleteToSublimeMark=function(t){var n=t.state.sublimeMark&&t.state.sublimeMark.find();if(n){var r=t.getCursor(),o=n;if(e.cmpPos(r,o)>0){var i=o;o=r,r=i}t.state.sublimeKilled=t.getRange(r,o),t.replaceRange("",r,o)}},t.swapWithSublimeMark=function(e){var t=e.state.sublimeMark&&e.state.sublimeMark.find();t&&(e.state.sublimeMark.clear(),e.state.sublimeMark=e.setBookmark(e.getCursor()),e.setCursor(t))},t.sublimeYank=function(e){null!=e.state.sublimeKilled&&e.replaceSelection(e.state.sublimeKilled,null,"paste")},t.showInCenter=function(e){var t=e.cursorCoords(null,"local");e.scrollTo(null,(t.top+t.bottom)/2-e.getScrollInfo().clientHeight/2)},C(h,"getTarget"),C(p,"findAndGoTo"),t.findUnder=function(e){p(e,!0)},t.findUnderPrevious=function(e){p(e,!1)},t.findAllUnder=function(e){var t=h(e);if(t){for(var n=e.getSearchCursor(t.query),r=[],o=-1;n.findNext();)r.push({anchor:n.from(),head:n.to()}),n.from().line<=t.from.line&&n.from().ch<=t.from.ch&&o++;e.setSelections(r,o)}};var g=e.keyMap;g.macSublime={"Cmd-Left":"goLineStartSmart","Shift-Tab":"indentLess","Shift-Ctrl-K":"deleteLine","Alt-Q":"wrapLines","Ctrl-Left":"goSubwordLeft","Ctrl-Right":"goSubwordRight","Ctrl-Alt-Up":"scrollLineUp","Ctrl-Alt-Down":"scrollLineDown","Cmd-L":"selectLine","Shift-Cmd-L":"splitSelectionByLine",Esc:"singleSelectionTop","Cmd-Enter":"insertLineAfter","Shift-Cmd-Enter":"insertLineBefore","Cmd-D":"selectNextOccurrence","Shift-Cmd-Space":"selectScope","Shift-Cmd-M":"selectBetweenBrackets","Cmd-M":"goToBracket","Cmd-Ctrl-Up":"swapLineUp","Cmd-Ctrl-Down":"swapLineDown","Cmd-/":"toggleCommentIndented","Cmd-J":"joinLines","Shift-Cmd-D":"duplicateLine",F5:"sortLines","Shift-F5":"reverseSortLines","Cmd-F5":"sortLinesInsensitive","Shift-Cmd-F5":"reverseSortLinesInsensitive",F2:"nextBookmark","Shift-F2":"prevBookmark","Cmd-F2":"toggleBookmark","Shift-Cmd-F2":"clearBookmarks","Alt-F2":"selectBookmarks",Backspace:"smartBackspace","Cmd-K Cmd-D":"skipAndSelectNextOccurrence","Cmd-K Cmd-K":"delLineRight","Cmd-K Cmd-U":"upcaseAtCursor","Cmd-K Cmd-L":"downcaseAtCursor","Cmd-K Cmd-Space":"setSublimeMark","Cmd-K Cmd-A":"selectToSublimeMark","Cmd-K Cmd-W":"deleteToSublimeMark","Cmd-K Cmd-X":"swapWithSublimeMark","Cmd-K Cmd-Y":"sublimeYank","Cmd-K Cmd-C":"showInCenter","Cmd-K Cmd-G":"clearBookmarks","Cmd-K Cmd-Backspace":"delLineLeft","Cmd-K Cmd-1":"foldAll","Cmd-K Cmd-0":"unfoldAll","Cmd-K Cmd-J":"unfoldAll","Ctrl-Shift-Up":"addCursorToPrevLine","Ctrl-Shift-Down":"addCursorToNextLine","Cmd-F3":"findUnder","Shift-Cmd-F3":"findUnderPrevious","Alt-F3":"findAllUnder","Shift-Cmd-[":"fold","Shift-Cmd-]":"unfold","Cmd-I":"findIncremental","Shift-Cmd-I":"findIncrementalReverse","Cmd-H":"replace",F3:"findNext","Shift-F3":"findPrev",fallthrough:"macDefault"},e.normalizeKeyMap(g.macSublime),g.pcSublime={"Shift-Tab":"indentLess","Shift-Ctrl-K":"deleteLine","Alt-Q":"wrapLines","Ctrl-T":"transposeChars","Alt-Left":"goSubwordLeft","Alt-Right":"goSubwordRight","Ctrl-Up":"scrollLineUp","Ctrl-Down":"scrollLineDown","Ctrl-L":"selectLine","Shift-Ctrl-L":"splitSelectionByLine",Esc:"singleSelectionTop","Ctrl-Enter":"insertLineAfter","Shift-Ctrl-Enter":"insertLineBefore","Ctrl-D":"selectNextOccurrence","Shift-Ctrl-Space":"selectScope","Shift-Ctrl-M":"selectBetweenBrackets","Ctrl-M":"goToBracket","Shift-Ctrl-Up":"swapLineUp","Shift-Ctrl-Down":"swapLineDown","Ctrl-/":"toggleCommentIndented","Ctrl-J":"joinLines","Shift-Ctrl-D":"duplicateLine",F9:"sortLines","Shift-F9":"reverseSortLines","Ctrl-F9":"sortLinesInsensitive","Shift-Ctrl-F9":"reverseSortLinesInsensitive",F2:"nextBookmark","Shift-F2":"prevBookmark","Ctrl-F2":"toggleBookmark","Shift-Ctrl-F2":"clearBookmarks","Alt-F2":"selectBookmarks",Backspace:"smartBackspace","Ctrl-K Ctrl-D":"skipAndSelectNextOccurrence","Ctrl-K Ctrl-K":"delLineRight","Ctrl-K Ctrl-U":"upcaseAtCursor","Ctrl-K Ctrl-L":"downcaseAtCursor","Ctrl-K Ctrl-Space":"setSublimeMark","Ctrl-K Ctrl-A":"selectToSublimeMark","Ctrl-K Ctrl-W":"deleteToSublimeMark","Ctrl-K Ctrl-X":"swapWithSublimeMark","Ctrl-K Ctrl-Y":"sublimeYank","Ctrl-K Ctrl-C":"showInCenter","Ctrl-K Ctrl-G":"clearBookmarks","Ctrl-K Ctrl-Backspace":"delLineLeft","Ctrl-K Ctrl-1":"foldAll","Ctrl-K Ctrl-0":"unfoldAll","Ctrl-K Ctrl-J":"unfoldAll","Ctrl-Alt-Up":"addCursorToPrevLine","Ctrl-Alt-Down":"addCursorToNextLine","Ctrl-F3":"findUnder","Shift-Ctrl-F3":"findUnderPrevious","Alt-F3":"findAllUnder","Shift-Ctrl-[":"fold","Shift-Ctrl-]":"unfold","Ctrl-I":"findIncremental","Shift-Ctrl-I":"findIncrementalReverse","Ctrl-H":"replace",F3:"findNext","Shift-F3":"findPrev",fallthrough:"pcDefault"},e.normalizeKeyMap(g.pcSublime);var S=g.default==g.macDefault;g.sublime=S?g.macSublime:g.pcSublime}(_(),q(),z());var E=J.exports;const Q=Y(E),ee=j({__proto__:null,default:Q},[E]);export{ee as s};