// ==UserScript==
// @name         lifeRestart
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  人生重开模拟器脚本，增加自选天赋控件
// @author       D780
// @match        http://liferestart.syaro.io/view/index.html*
// @icon         https://www.google.com/s2/favicons?domain=syaro.io
// @grant        none
// ==/UserScript==
/* global window document $ */
/* eslint-disable strict */

(async function() {
  'use strict';

  const talentMap = await window.json('talents');
  let lastTalentList;
  try {
    lastTalentList = JSON.parse(window.localStorage.getItem('lastTalents') || '[]');
  } catch (err) {
    lastTalentList = [];
  }

  function addTalent(id) {
    const oriTalent = window.localStorage.getItem('extendTalent');

    window.localStorage.setItem('extendTalent', id);
    $('#random').click();
    addLastTalent(id);
    const talentList = $('#talents').children();
    const rmList = Array.prototype.slice.call(talentList, -9);
    rmList.forEach(item => item.remove());

    window.localStorage.setItem('extendTalent', oriTalent);
  }

  function searchTalents(key, size) {
    const ret = [];
    const reg = new RegExp(`.*${`${key}`.split(' ').join('.*')}.*`);
    size = (size > 10 || size <= 0) ? 10 : (size || 10);
    for (const id in talentMap) {
      if (ret.length >= size) {
        break;
      }
      if (reg.test(id) || reg.test(talentMap[id].name) || reg.test(talentMap[id].description)) {
        ret.push(talentMap[id]);
      }
    }
    return ret;
  }

  function addLastTalent(id) {
    if (lastTalentList.indexOf(Number(id)) >= 0) {
      return;
    }
    lastTalentList.push(Number(id));
    if (lastTalentList.length > 10) {
      lastTalentList.shift();
    }
    window.localStorage.setItem('lastTalents', JSON.stringify(lastTalentList));
  }

  function inject() {
    if ($('#main')[0] && $('#main').text().indexOf('天赋抽卡') === -1) {
      return;
    }
    if ($('#extra-panel')[0]) {
      return;
    }

    const theme = window.localStorage.getItem('theme') || 'dark';
    let color = '#EEEEEE';
    if(theme ==='light'){
      color = '#000000';
    }

    const panelEle = $(`<div id="extra-panel" style="top: 3.5rem; width: calc(25% - 2rem); left: 0.5rem; position: fixed; color: ${color}">
    <div style="">自选天赋</div>
    <div style="margin-top:0.6rem; ">
      <input id="ep-search" type="text" placeHolder="搜索天赋" style="
        outline-style: none;
        background-color: #eee;
        text-align: center;
        text-overflow:ellipsis;
        width: 100%;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: 0.2rem;
        padding: 0;
        ">
      <ul id="ep-search-result" style="list-style-type: none; padding-inline-start: 0; margin-block-start: 0; position: absolute; width: 100%;"></ul>
    </div>
    <div style="margin-top:0.6rem; ">最近天赋</div>
    <ul id="ep-last-talents" style="list-style-type: none; padding-inline-start: 0;"></ul></div>`);

    $('#main').append(panelEle);

      $('#next').on('click', () => panelEle.remove())

    const searchEle = $('#ep-search');
    const searchResultEle = $('#ep-search-result');
    searchEle.on('input', e => {
      if (e.target.value) {
        const ret = searchTalents(e.target.value);
        searchResultEle[0].innerHTML = '';
        ret.forEach(tobj => {
          const li = createTalentSMItem(tobj);
          li.on('click', () => {
            addTalent(tobj.id);
            searchResultEle[0].innerHTML = '';
            searchEle.value = '';
          });
          searchResultEle.append(li);
        });
      }
    });

    const lastTalentEle = $('#ep-last-talents');
    lastTalentEle[0].innerHTML = '';
    if (lastTalentList.length === 0) {
      lastTalentEle[0].innerHTML = '你还没有选择过天赋~';
    } else {
      lastTalentList.forEach(tid => {
        const tobj = talentMap[tid];
        if (tobj) {
          const li = createTalentSMItem(tobj);
          li.css('margin','0.1rem auto');
          li.on('click', () => {
            addTalent(tobj.id);
          });
          lastTalentEle.append(li);
        }
      });
    }
  }

  function createTalentSMItem({ grade, name, description }) {
    return $(`<li class="grade${grade}b" title="${description}" style="cursor: pointer;text-align: center;border-radius: 0.2rem;">${name}</li>`);
  }

  setInterval(() => inject(), 500);

  window.addTalent = addTalent;
  window.searchTalents = searchTalents;
}());
