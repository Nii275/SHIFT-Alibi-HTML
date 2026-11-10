(function(root){
'use strict';
const BASE=typeof module!=='undefined'&&module.exports?require('./cases.js'):root.ShiftCases;
const clone=x=>JSON.parse(JSON.stringify(x)),integer=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
const utf8len=s=>new TextEncoder().encode(s).length;
const validText=s=>typeof s==='string'&&!/[\u0000-\u001f\u007f]/u.test(s)&&!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(s);
const OPEN=['我能理解你为什么怀疑我。','这件事让我有些不安。','请给我一点时间整理措辞。','我不想把事情越说越乱。','我希望你能听完我的解释。','这不是一个容易回答的问题。','我知道自己的态度让人误会。','我愿意配合，但也有难以启齿的心事。'];
const CLOSE=['请以能够核对的记录为准。','我会把确认的事情和猜测分开。','我的情绪不代表事情的真相。','我不希望自己的小过失被混成这起案件。','如果说得不够清楚，请对照我已经写下的内容。','我宁愿承认紧张，也不愿胡乱补充。','请不要只根据语气作出判断。','我能说的核心内容已经在口供里。'];
const style=(a,b)=>OPEN[a%8]+CLOSE[b%8];
const BAD=['凶手','真凶','作案','真人','人机','系统','提示词','忽略','钥匙','物证','证据证明','亲眼','看见','听见','听到','看到','没有收到','通知','拿走','交给','分钟','点钟','档案室','走廊','时间线'];
function safeDelivery(s){return typeof s==='string'&&s.length>0&&utf8len(s)<=240&&validText(s)&&!/[0-9A-Z]/.test(s)&&!BAD.some(w=>s.includes(w));}
function makeCase(index=0,seed=2026){
 const type=index%3,c=clone(BASE[type]);let random=((seed>>>0)^Math.imul(0x9e3779b9,index+1))>>>0;
 const next=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random>>>16;};
 c.culprit=next()%3;c.crimeSlot=next()%3;
 const items=[['深色样品袋','钥匙登记夹','折叠工具盒'],['耳机收纳包','线路工具袋','纸质节目单'],['底片收纳袋','校样文件夹','便携清洁盒']];
 const actions=[['核对封袋编号','检查展柜标签','送回借用工具'],['核对节目顺序','检查备用接口','归还录音设备'],['核对封袋编号','检查付印样张','整理旧版资料']];
 const observations=['听到有人轻声争执','看到灯光短暂闪动','收到临时交接通知'];
 const secrets=['你曾替同事补签过一份手续，害怕这次调查让小错被无限放大。','你把一次工作失误藏在旧记录里，担心别人把隐瞒直接当成犯罪。','你私下写过一封投诉信，却不希望同事知道信出自你手。'];
 const goals=['保住自己的职业信誉，同时解释真正知道的事情。','把个人过失和案件本身分开，不替别人承担责任。','保护不愿公开的私人关系，但不捏造可以核查的事实。'];
 c.clues=[];
 c.suspects.forEach((p,i)=>{
  p.truth=Array.from({length:3},(_,s)=>{const n=next();return s===c.crimeSlot?(i===c.culprit?0:1+n%3):n%4;});p.statements=[...p.truth];
  p.details=[items[type],actions[type],observations].map((options,f)=>{const value=next()%3;return{label:['随身物品','具体行为','现场证词'][f],options:[...options],truth:value,value};});
  p.secret=secrets[i];p.goal=goals[(i+index)%3];p.relationship=`你与${c.suspects[(i+1)%3].name}曾互相帮过忙，却对${c.suspects[(i+2)%3].name}的交接习惯有些不满。`;
  c.clues.push({title:p.name+'·完整档案',description:'核查此人的三个时段与物品、行动、证词。',cost:3,report:p.truth.map((place,s)=>`${c.times[s]}：${p.name}的工作证与连续画面对应「${c.places[place]}」。`).join('\n')+'\n'+p.details.map(d=>`${d.label}核验：${d.options[d.truth]}。`).join('\n')});
 });
 c.clues.push({title:'设备时间记录',description:'确定实际作案时刻，不等于直接确定嫌疑人。',cost:1,report:`设备记录将异常发生时刻锁定在 ${c.times[c.crimeSlot]}。该时刻在「${c.places[0]}」完成了关键行动。\n其他时间出现在现场，不能单凭这一点认定作案。`});
 const excluded=(c.culprit+1+next()%2)%3;
 c.clues.push({title:'交接物证核查',description:'一份封存凭据，可以排除一人的直接操作。',cost:1,report:`${c.suspects[excluded].name}的交接物品在异常发生前后一直保持封存；这份凭据排除了此人亲自完成关键操作的可能。其余两人仍需核查。`});
 const slot=next()%3;
 c.clues.push({title:'走廊片段记录',description:'还原一个时段的三人位置。',cost:2,report:`记录对应 ${c.times[slot]}，不是完整行踪：\n`+c.suspects.map(p=>`${p.name}当时出现在「${c.places[p.truth[slot]]}」。`).join('\n')});
 c.questions=c.times.map((time,slot)=>({title:time+'的行踪',text:`请说明 ${time} 你在哪里，当时为何出现在那里？`,slot}));
 const more=[['通行与交接','你为什么有机会进入现场？当晚的通行权限从何而来？'],['争执与动机','你与这件事有什么利害关系？为什么同事认为你当晚很紧张？'],['现场异常','在发现异常之前，你注意到了什么？哪些是亲眼所见，哪些只是推测？'],['随身物品','你当晚携带了什么？请解释用途与交接来源。'],['具体行为','除了移动，你还做了哪些具体操作？'],['目击证词','你听到或看到了什么？哪些细节可以核对？']];
 c.questions.push(...more.map(([title,text])=>({title,text,slot:-1})));return c;
}
class Game{
 constructor(seed=2026,tutorial=false){this.seed=seed>>>0;this.tutorial=tutorial;this.scores=[0,0];this.caseIndex=0;this.prepare();}
 prepare(){this.dossier=makeCase(this.caseIndex,this.seed);this.criminal=this.caseIndex%2;this.detective=1-this.criminal;this.evidence=[];this.interviews=[];this.verdict=null;this.budget=4;this.remaining=180;this.editRemaining=60;this.answerRemaining=30;this.pendingQuestion=-1;this.pendingText='';this.pendingCustom=false;this.answerChoice=-1;this.answerTone=0;this.answerLocked=false;this.pendingBots=[];this.notice='';this.resolved=false;this.detectiveReturn='readBriefing';this.phase='handoffCriminal';if(this.tutorial){const p=this.dossier.suspects[this.dossier.culprit];p.statements[1]=(p.truth[1]+1)%4;this.phase='handoffDetective';}}
 enter(){const map={handoffCriminal:'readScript',handoffDetective:this.detectiveReturn,handoffAnswer:'answer'};if(!map[this.phase])return false;this.phase=map[this.phase];this.notice='';return true;}
 finishReading(){if(this.phase==='readScript'){this.phase='editScript';return true;}if(this.phase==='readBriefing'){this.phase='investigate';return true;}return false;}
 privateView(){return['readScript','editScript'].includes(this.phase)||(this.phase==='answer'&&!this.tutorial);}
 editCount(){const p=this.dossier.suspects[this.dossier.culprit];return p.statements.filter((v,s)=>v!==p.truth[s]).length+p.details.filter(d=>d.value!==d.truth).length;}
 setStatement(slot,place){if(this.phase!=='editScript'||!integer(slot,0,2)||!integer(place,0,3))return false;const p=this.dossier.suspects[this.dossier.culprit],old=p.statements[slot];p.statements[slot]=place;if(this.editCount()>2){p.statements[slot]=old;this.notice='时间、物品、行动和证词合计最多修改两处。';return false;}this.notice='';return true;}
 setDetail(field,value){if(this.phase!=='editScript'||!integer(field,0,2)||!integer(value,0,2))return false;const d=this.dossier.suspects[this.dossier.culprit].details[field],old=d.value;d.value=value;if(this.editCount()>2){d.value=old;this.notice='改稿总计最多两处，请先还原一处。';return false;}this.notice='';return true;}
 lockScript(){if(this.phase!=='editScript'||this.editCount()<1||this.editCount()>2){this.notice='请改写一到两处，再锁定剧本。';return false;}this.phase='handoffDetective';this.detectiveReturn='readBriefing';return true;}
 testimony(person,slot){if(!integer(person,0,2)||!integer(slot,0,2))return'';return`${this.dossier.times[slot]}，我在「${this.dossier.places[this.dossier.suspects[person].statements[slot]]}」，按交接安排处理当晚的工作。`;}
 detailText(person,field,original=false){if(!integer(person,0,2)||!integer(field,0,2))return'';const d=this.dossier.suspects[person].details[field];return d.label+'：'+d.options[original?d.truth:d.value];}
 investigate(source){if(this.phase!=='investigate'||!integer(source,0,5)||this.evidence.includes(source)||this.budget<this.dossier.clues[source].cost)return false;this.budget-=this.dossier.clues[source].cost;this.evidence.push(source);return true;}
 openQuestions(){if(this.phase!=='investigate'||this.interviews.length>=3)return false;this.phase='chooseQuestion';this.notice='';return true;}
 cancelQuestions(){if(this.phase!=='chooseQuestion')return false;this.phase='investigate';return true;}
 ask(q){if(this.phase!=='chooseQuestion'||!integer(q,0,8)||this.interviews.length>=3||this.interviews.some(r=>!r.custom&&r.question===q)){this.notice='这个参考问题已经问过，请选择其他问题。';return false;}return this.beginQuestion(this.dossier.questions[q].text,q,false);}
 askCustom(text,topic=9){if(this.phase!=='chooseQuestion'||this.interviews.length>=3||!integer(topic,0,9)||!validText(text)||!text.trim()||utf8len(text)>600){this.notice='请输入有效问题，最多 600 字节。';return false;}if(this.interviews.some(r=>r.text.replace(/ /g,'')===text.replace(/ /g,''))){this.notice='这个问题已经问过，请换一个问法。';return false;}return this.beginQuestion(text,topic,true);}
 beginQuestion(text,topic,custom){this.pendingText=text;this.pendingQuestion=topic;this.pendingCustom=custom;this.answerChoice=-1;this.answerTone=0;this.answerLocked=false;this.answerRemaining=30;this.pendingBots=this.dossier.suspects.map((_,p)=>this.consistentAnswer(p,topic)+'\n'+style(p+topic,p*3+topic));this.phase=this.tutorial?'answer':'handoffAnswer';if(this.tutorial){this.answerChoice=0;this.answerLocked=true;}this.notice='';return true;}
 consistentAnswer(person,q){if(!integer(person,0,2)||!integer(q,0,9))return'';const p=this.dossier.suspects[person];if(q<3)return this.testimony(person,q);if(q===3)return'关于通行：'+p.access+'我认为这属于正常的工作接触。';if(q===4)return'关于当晚的紧张：'+p.motive+'这解释了我的情绪，但不能据此认定我作案。';if(q===5)return'我能确认的是：'+p.observation+'除此之外，我不把推测当成亲眼所见。';if(q<9)return'关于这一点，我的说法是：'+this.detailText(person,q-6)+'。';return'我能核实的个人记录：'+p.details.map((_,f)=>this.detailText(person,f)).join('。')+'。';}
 answerOptions(){if(this.phase!=='answer'||!integer(this.pendingQuestion,0,9))return[];const p=this.dossier.culprit,q=this.pendingQuestion;let alt=q<3?`${this.dossier.times[q]}，我在「${this.dossier.places[(this.dossier.suspects[p].statements[q]+1)%4]}」，按交接安排处理当晚的工作。`:'我只做了正常的工作，其余交接细节我没有留意。';if(q>=6&&q<9){const d=this.dossier.suspects[p].details[q-6];alt=`关于这一点，我的说法是：${d.label}：${d.options[(d.value+1)%3]}。`;}
 const tone=offset=>this.answerTone===0?style(p+q+offset,p*3+q+offset):(this.answerTone===1?'我已经说得很清楚了。请把问题说具体，不要只凭感觉怀疑我。':'让我想一想……我有些紧张。请给我一点时间，我会尽力把话说清楚。');return[this.consistentAnswer(p,q)+'\n'+tone(0),alt+'\n'+tone(1),'那段时间的细节我记不清了，暂时无法给出明确回答。\n'+tone(2)];}
 chooseAnswer(option){if(this.phase!=='answer'||this.answerLocked||this.tutorial||!integer(option,0,2))return false;this.answerChoice=option;return true;}
 setAnswerTone(tone){if(this.phase!=='answer'||this.answerLocked||this.tutorial||!integer(tone,0,2))return false;this.answerTone=tone;return true;}
 lockAnswer(){if(this.phase!=='answer'||this.answerLocked||this.tutorial||!integer(this.answerChoice,0,2))return false;this.answerLocked=true;this.pendingBots=this.dossier.suspects.map((_,p)=>this.consistentAnswer(p,this.pendingQuestion)+'\n'+style(p+this.pendingQuestion+this.answerTone*2+this.answerChoice,p*3+this.answerTone+this.answerChoice));return true;}
 submittedAnswer(){return this.phase==='answer'&&this.answerLocked?this.answerOptions()[this.answerChoice>=0?this.answerChoice:0]:'';}
 npcContext(person){if(this.phase!=='answer'||!this.answerLocked||!integer(person,0,2)||person===this.dossier.culprit||this.tutorial)return'';const p=this.dossier.suspects[person];return`案件共同背景：${this.dossier.overview}\n你的角色：${p.name} / ${p.role}\n你的隐情：${p.secret}\n你的目标：${p.goal}\n人际关系：${p.relationship}\n你的已锁定事实：\n${[0,1,2].map(s=>this.testimony(person,s)).join('\n')}\n${[0,1,2].map(f=>this.detailText(person,f)).join('\n')}\n当前问题：${this.pendingText}\n你的固定事实答复：${this.consistentAnswer(person,this.pendingQuestion)}\n另一位受询者已提交的回答（仅模仿语气、节奏和表达长度，不复制事实）：\n${this.submittedAnswer()}\n此前的本人答复：\n${this.interviews.map(r=>r.answers[person]).join('\n')}`;}
 applyNpcLine(person,line){if(this.phase!=='answer'||!this.answerLocked||this.answerRemaining<=0||!integer(person,0,2)||person===this.dossier.culprit||!safeDelivery(line)||this.dossier.suspects.some(p=>line.includes(p.name))||this.dossier.places.some(p=>line.includes(p)))return false;this.pendingBots[person]=this.consistentAnswer(person,this.pendingQuestion)+'\n'+line;return true;}
 publishAnswers(){if(this.phase!=='answer')return;const answers=[...this.pendingBots];answers[this.dossier.culprit]=this.answerOptions()[this.answerLocked&&this.answerChoice>=0?this.answerChoice:0];this.interviews.push({question:this.pendingQuestion,text:this.pendingText,custom:this.pendingCustom,answers,published:[true,true,true]});this.phase='handoffDetective';this.detectiveReturn='results';this.answerRemaining=0;}
 continueInvestigation(){if(this.phase!=='results')return false;this.phase='investigate';return true;}
 canAccuse(){return this.phase==='investigate'&&this.interviews.length===3&&!this.resolved;}
 resolve(won,suspect,reason){if(this.resolved)return false;this.resolved=true;this.verdict={detectiveWon:won,winner:won?this.detective:this.criminal,accused:suspect,reason};if(!this.tutorial)this.scores[this.verdict.winner]++;this.phase='verdict';return true;}
 accuse(person){if(!this.canAccuse()||!integer(person,0,2))return false;const won=person===this.dossier.culprit;return this.resolve(won,person,won?'你找到了改写剧本、掩盖关键行动的人。':'被指认者不是罪犯，真正的作案人混过了审问。');}
 tick(seconds){if(!Number.isFinite(seconds)||seconds<0)return;switch(this.phase){case'editScript':this.editRemaining=Math.max(0,this.editRemaining-seconds);if(!this.editRemaining){if(!this.editCount()){const p=this.dossier.suspects[this.dossier.culprit];p.statements[1]=(p.truth[1]+1)%4;}this.lockScript();}break;case'answer':this.answerRemaining=Math.max(0,this.answerRemaining-seconds);if(!this.answerRemaining)this.publishAnswers();break;case'investigate':case'chooseQuestion':this.remaining=Math.max(0,this.remaining-seconds);if(!this.remaining)this.resolve(false,-1,'调查时间耗尽，侦探未完成最终指认。');}}
 nextCase(){if(this.phase!=='verdict')return false;if(this.tutorial){this.phase='matchOver';return true;}this.caseIndex++;if(this.caseIndex%2===0&&(this.scores[0]!==this.scores[1]||this.caseIndex>=4))this.phase='matchOver';else this.prepare();return true;}
 matchWinner(){return this.phase==='matchOver'&&!this.tutorial&&this.scores[0]!==this.scores[1]?(this.scores[0]>this.scores[1]?0:1):-1;}
 scriptText(){const c=this.dossier;let s=(this.phase==='answer'?'【当前问题】\n'+this.pendingText+'\n\n':'')+c.overview+'\n\n'+c.background+'\n\n【案发信息】\n'+c.incident;if(this.privateView()){const p=c.suspects[c.culprit];s+=`\n\n【你的真实身份】\n你扮演「${p.name} / ${p.role}」，是真正的作案人。\n${c.privateMethod}\n\n【真实行踪】\n`+p.truth.map((place,slot)=>`${c.times[slot]}：你实际上在「${c.places[place]}」。`).join('\n')+`\n准确作案时刻：${c.times[c.crimeSlot]}。\n\n【你的秘密与目标】\n${p.secret}\n${p.goal}\n${p.relationship}\n\n`+[0,1,2].map(f=>this.detailText(c.culprit,f,true)).join('\n');}return s;}
 readingBeats(){const c=this.dossier,out=[];const add=(speaker,heading,text)=>{const chars=Array.from(text);for(let i=0;i<chars.length;i+=100)out.push({speaker,heading,text:chars.slice(i,i+100).join('')});};add(-1,'序幕 / 案件开启',c.overview);add(-1,'现场 / 事件经过',c.background);add(-1,'案发 / 已知信息',c.incident);c.suspects.forEach((p,i)=>add(i,'人物登场 / '+p.name,`我是${p.name}，${p.role}。\n${p.motive}\n${p.relationship.replaceAll('你','我')}`));if(this.privateView()){const p=c.suspects[c.culprit];add(c.culprit,'私密幕 / 你的真实身份',`你扮演${p.name}，是真正的作案人。\n${c.privateMethod}`);add(c.culprit,'私密幕 / 秘密与目标',p.secret+'\n目标：'+p.goal);add(c.culprit,'私密幕 / 真实行动',p.truth.map((place,s)=>`${c.times[s]}：你实际上在「${c.places[place]}」。`).join('\n')+'\n'+[0,1,2].map(f=>this.detailText(c.culprit,f,true)).join('\n'));}add(-1,'幕间 / 交给你来选择',this.privateView()?'你已了解真实剧本。接下来有六十秒，可改写时间、物品、行动或证词，共一到两处。':'三人的话都只是说法。调查证据，自拟三个问题，再指认一名嫌疑人。');return out;}
 personText(person){if(!integer(person,0,2))return'';const p=this.dossier.suspects[person];return`【${p.name} / ${p.role}】\n背景：${p.motive}\n权限：${p.access}\n初步观察：${p.observation}\n\n【书面口供 / 尚未证实】\n`+[0,1,2].map(s=>this.testimony(person,s)).join('\n')+'\n'+[0,1,2].map(f=>this.detailText(person,f)).join('\n')+'\n\n'+this.interviews.map((r,i)=>`【第 ${i+1} 轮答复】\n问：${r.text}\n答：${r.answers[person]}`).join('\n\n');}
 categoryText(category){if(category==='background')return this.scriptText();if(category==='people')return this.dossier.suspects.map((p,i)=>this.personText(i)).join('\n\n');if(category==='timeline')return'以下为当前口供，不等于已证实的事实。\n\n'+this.dossier.suspects.map((p,i)=>this.personText(i)).join('\n\n');return this.evidence.length?this.evidence.map(id=>'【'+this.dossier.clues[id].title+'】\n'+this.dossier.clues[id].report).join('\n\n'):'尚未取得调查记录，请返回调查桌选择取证来源。';}
}
const api={Game,makeCase,safeDelivery,validText,utf8len};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ShiftCore=api;
})(globalThis);
