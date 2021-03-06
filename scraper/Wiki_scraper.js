var scraperjs = require('scraperjs'),
    input_file = require('./scraper_input.json'),
    fs = require('fs'),
    async = require('async'),
    ALIAS = require('./utility/alias.json'),
    SETCODES = require('./utility/setcode.json'),
    ATTRIBUTES = require('./utility/attributes.json'),
    RACE = require('./utility/race.json'),
    MONSTER_TYPE = require('./utility/monster_type.json'),
    ST_TYPE = require('./utility/st_type.json'),
    PRERELEASE = require('./utility/prerelease.json'),
    markers;

async.each(input_file, function (wiki_url, next) {
    scraperjs.StaticScraper.create()
        .request({ url: encodeURI('http://yugioh.wikia.com/wiki/'+wiki_url).replace('#','').replace('?','%3F'), encoding: 'utf8', headers: {connection: 'keep-alive'}, agent: false })
        .scrape(function($) {
            // Setcode operation
            console.log('Reading: '+encodeURI('http://yugioh.wikia.com/wiki/'+wiki_url));
            var setcode = [],
                setcode_math = [],
                bit = [],
                card = {},
                links = [],
                i, j,
                m_types,
                // Initiate json
                card_json = {'ocg':{}, 'tcg':{}},
                //OCG Pack Info
                ocg_list = $('.navbox-list caption').next().next().text().trim().split('\n \n'),
                //TCG Pack Info
                tcg_list = $('.navbox-list caption').next().next().text().trim().split('\n \n'),
                wstream;
            $('dt').filter(function() {
                return $(this).text().match(/Archetypes and series(.*)/);
            }).nextUntil('dt').each(function() {
                    setcode.push($(this).text().trim());
                });
            for (i = 0; i < setcode.length; i++) {
                setcode_math.push(SETCODES[setcode[i]]);
            }
            setcode_math = setcode_math.filter(function(n) {
                return n !== undefined;
            });
            setcode = '';
            for (j = 0; j < setcode_math.length; j++) {
                bit = setcode_math[j];
                if (bit.length < 5) {
                    bit = bit.replace('0x', '00');
                } else {
                    bit = bit.replace('0x', '');
                }
                setcode += bit;
            }
            setcode = parseInt(setcode.toString(16),16);
            if (isNaN(setcode)) {
                setcode = 0;
            }
            // Scrape most of the other card information
            $('.cardtablerowheader').each(function() {
                return $(this).each( function(index) {
                    card[$(this).text()] = $(this).next().text();
                });
            });
            tcg_list = tcg_list.filter(function(n) {
                return n.match(/\d\d\d\d\-\d\d\-\d\d/);
            });
            tcg_list = tcg_list.filter(function(n) {
                return !n.match(/[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g);
            });
            tcg_list = tcg_list.filter(function(n) {
                return !n.match(/\-[A-Z][0-9]|\-KR/);
            }).sort()[0];
            if (tcg_list !== undefined) {
                tcg_list = tcg_list.trim().split('\n');
                card_json.tcg.pack = tcg_list[2].trim();
                card_json.tcg.pack_id = tcg_list[1].trim();
                card_json.tcg.date = tcg_list[0].trim();
            }

            ocg_list = ocg_list.filter(function(n) {
                return n.match(/\d\d\d\d\-\d\d\-\d\d/);
            });
            ocg_list = ocg_list.filter(function(n) {
                return n.match(/[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g);
            }).sort()[0];
            if (ocg_list !== undefined) {
                ocg_list = ocg_list.trim().split('\n');
                card_json.ocg.pack = ocg_list[2].trim();
                card_json.ocg.pack_id = ocg_list[1].trim();
                card_json.ocg.date = ocg_list[0].trim();
            }

            if (!isNaN(card.Passcode)) {
            card_json.id = parseInt(card.Passcode);
            } else {
                if (ocg_list !== undefined) {
                    card_json.id = parseInt(PRERELEASE[card_json.ocg.pack_id.split('-JP')[0]] + card_json.ocg.pack_id.split('-JP')[1]);
                } else if (tcg_list !== undefined) {
                    card_json.id = parseInt(PRERELEASE[card_json.tcg.pack_id.split('-DE')[0]] + card_json.tcg.pack_id.split('-DE')[1]);
                } else {
                    card_json.id = undefined;
                }
            }

            card_json.setcode = setcode;
            if (card['Card type'] === '\nMonster ') {
                if (card.Types) {
                    m_types = card.Types;
                } else {
                    m_types = card.Type + ' / Normal';
                }
                card_json.type = MONSTER_TYPE[(m_types.split(' / ')[1] + ' / ' + m_types.split(' / ')[2] + ' / ' + m_types.split(' / ')[3]).replace('/ undefined','').replace('  / undefined','').trim()];
                if (m_types.split(' / ')[1] === 'Xyz') {
                    card_json.level = parseInt(card.Rank);
                }
                if (m_types.split(' / ')[1] !== 'Link') {
                    if (card['ATK / DEF'].split(' / ')[0].trim() === '?') {
                        card_json.atk = -2;
                    } else {
                        card_json.atk = parseInt(card['ATK / DEF'].split(' / ')[0]);
                    }
                    if (card['ATK / DEF'].split(' / ')[1].trim() === '?') {
                        card_json.def = -2;
                    } else {
                        card_json.def = parseInt(card['ATK / DEF'].split(' / ')[1]);
                    }
                    card_json.level = parseInt(card.Level);
                    if (m_types.split(' / ')[1] === 'Pendulum' || m_types.split(' / ')[2] === 'Pendulum') {
                        if (m_types.split(' / ')[1] === 'Xyz') {
                            card_json.level = parseInt('0x' + parseInt(card['Pendulum Scale']).toString(16) + '0' + parseInt(card['Pendulum Scale']).toString(16) + '000' + parseInt(card.Rank).toString(16),16);
                        } else {
                            card_json.level = parseInt('0x' + parseInt(card['Pendulum Scale']).toString(16) + '0' + parseInt(card['Pendulum Scale']).toString(16) + '000' + parseInt(card.Level).toString(16),16);
                        }
                    }
                } else {
                        if (card['ATK / LINK'].split(' / ')[0].trim() === '?') {
                            card_json.atk = -2;
                        } else {
                            card_json.atk = parseInt(card['ATK / LINK'].split(' / ')[0]); 
                        }
                        card_json.def = '-';
                        card_json.level = parseInt(card['ATK / LINK'].split(' / ')[1]);
                        markers = card['Link Arrows'].replace('Top-Left', '[🡴]').replace('Top-Right', '[🡵]').replace('Bottom-Left', '[🡷]').replace('Bottom-Right', '[🡶]').replace('Top', '[🡱]').replace('Bottom', '[🡳]').replace('Left', '[🡰]').replace('Right', '[🡲]').replace(/\s,\s/g, '').trim();
                        if (markers.includes('[🡴]')) {
                            links.push(0);
                        }
                        if (markers.includes('[🡱]')) {
                            links.push(1);
                        }
                        if (markers.includes('[🡵]')) {
                            links.push(2);
                        }
                        if (markers.includes('[🡰]')) {
                            links.push(3);
                        }
                        if (markers.includes('[🡲]')) {
                            links.push(4);
                        }
                        if (markers.includes('[🡷]')) {
                            links.push(5);
                        }
                        if (markers.includes('[🡳]')) {
                            links.push(6);
                        }
                        if (markers.includes('[🡶]')) {
                            links.push(7);
                        }
                        card_json.links = links;
                    }
                card_json.race = RACE[m_types.split(' / ')[0].trim()];
                card_json.attribute = ATTRIBUTES[card.Attribute.trim()];
            } else {
                card_json.type = ST_TYPE[card['Card type'].trim() + ' / ' + card.Property.trim()];
                card_json.atk = 0;
                card_json.def = 0;
                card_json.level = 0;
                card_json.race = 0;
                card_json.attribute = 0;
            }
            card_json.name = card.English.trim().replace('Check translation','');
            card_json.desc = $('.navbox-list').eq(0).html().replace(/\<br\>/g,'\n').replace(/<.*?>/g,'').replace(/&apos;/g, '\'').replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&#x2019;/g, '\'').replace(/&#x25CF;/g, '●').replace(/\n /g, '\n').trim();
            if (card_json.desc.match(/\(This card's name is always treated as \"(.*)\"/)) {
                card_json.alias = parseInt(ALIAS[card_json.desc.match(/\(This card's name is always treated as \"(.*)\"/)[1]]);
            }
            if (markers !== undefined) {
                card_json.desc = 'Link Arrows: ' + markers + '\n\n' + card_json.desc;
            }
            card_json.picture = $('.cardtable-cardimage').eq(0).html().match(/<a href=\"(.*?)\/revision/)[1];
            wstream = fs.createWriteStream('..\\http\\json\\'+card_json.id+'.json');
            wstream.write(JSON.stringify(card_json, null, 4));
            wstream.end();
            markers = undefined;
            next();
        });
    }), function(err) {
        console.log('All Done');
    };