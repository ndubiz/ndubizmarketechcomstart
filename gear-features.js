(() => {
 'use strict';
 document.querySelectorAll('[data-gear-cards]').forEach(group => {
   group.addEventListener('toggle', event => {
     const card=event.target;
     if(card.matches('details.gear-card') && card.open) document.querySelectorAll('details.gear-card[open]').forEach(other=>{if(other!==card)other.open=false;});
   },true);
 });
 document.querySelectorAll('[data-gear-quiz]').forEach(quiz => {
   const catalog=JSON.parse(quiz.querySelector('[data-quiz-catalog]').textContent);
   const area=quiz.querySelector('[data-quiz-content]');
   const intro=quiz.querySelector('[data-quiz-intro]');
   let answers={},step=0;
   const questions=[
    {key:'category',label:'What are you shopping for?',options:[['security','Home security'],['lighting','Smart lighting'],['office','Home office']]},
    {key:'budget',label:'How would you like to spend?',options:[['value','Keep costs down'],['balanced','Balance cost and features'],['flexible','Flexible for the right fit']]},
    {key:'need',label:'What matters most?',options:()=>({security:[['camera','Monitor a space'],['lock','Upgrade door access']],lighting:[['bulb','Everyday room lighting'],['accent','Decorative accent lighting']],office:[['calls','Video calls'],['recording','Record notes and conversations']]}[answers.category])}
   ];
   const el=(tag,text,cls)=>{let e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
   function button(label,fn,cls){let b=el('button',label,cls);b.type='button';b.addEventListener('click',fn);return b;}
   function render(focus=true){
     area.replaceChildren();intro.hidden=true;
     if(step<3){
       const q=questions[step],progress=el('div',`Question ${step+1} of 3`,'gear-quiz-progress');area.append(progress);
       let meter=el('progress');meter.max=3;meter.value=step+1;meter.setAttribute('aria-label','Quiz progress');area.append(meter);
       const set=el('fieldset'),legend=el('legend',q.label);legend.tabIndex=-1;set.append(legend);
       const opts=el('div',null,'gear-options');const choices=typeof q.options==='function'?q.options():q.options;
       choices.forEach(([value,label])=>opts.append(button(label,()=>{answers[q.key]=value;step++;render();})));set.append(opts);area.append(set);
       if(step)area.append(button('← Back',()=>{step--;render();},'gear-quiz-back'));
       if(focus)legend.focus();return;
     }
     const heading=el('h3','Your starting shortlist');heading.tabIndex=-1;area.append(heading);
     const candidates=catalog.filter(p=>p.category===answers.category&&p.need===answers.need);
     candidates.sort((a,b)=>(a.tier===answers.budget?-1:0)-(b.tier===answers.budget?-1:0));
     const picks=candidates.slice(0,2);
     area.append(el('p','Matched to your use and spending preference. Prices change: compare the retailer’s current total with your budget.','gear-muted'));
     if(!picks.length)area.append(el('p','No reviewed match yet. Browse the comparison guides below rather than buying an unrelated recommendation.'));
     picks.forEach(p=>{
       let card=el('article',null,'gear-result-card');card.append(el('h3',p.name),el('p',p.reason));
       let read=el('a','Read the review');read.href=p.review;card.append(read,document.createTextNode(' · '));
       let buy=el('a','Check current price','gear-btn');buy.href=p.buy;buy.target='_blank';buy.rel='nofollow sponsored noopener';card.append(buy);area.append(card);
     });
     area.append(el('p','Affiliate disclosure: we may earn a commission from purchases through these links.','gear-muted'));
     area.append(button('← Change my last answer',()=>{step=2;render();},'gear-quiz-back'),document.createTextNode(' '),button('Start again',()=>{answers={};step=0;render();},'gear-btn'));
     heading.focus();
   }
   quiz.querySelector('[data-quiz-start]').addEventListener('click',()=>render());
 });
})();
