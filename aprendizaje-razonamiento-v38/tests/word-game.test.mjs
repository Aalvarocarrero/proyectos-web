import test from 'node:test';
import assert from 'node:assert/strict';
import {wordActivity,wordScenes,newWordGame,wordFeedback,chooseMeaning,chooseClue,checkWordAnswer,showWordHint,selectWordScene,selectWordPage,resetWordGame} from '../dist/word-game.mjs';

test('bounded original pilot has three words, two different contexts each and specific evidence',()=>{
  assert.equal(wordScenes.length,6);
  assert.match(wordActivity.age,/7–8/);
  assert.match(wordActivity.evidence,/todavía no se ha evaluado/);
  for(let i=0;i<6;i+=2){
    assert.equal(wordScenes[i].word,wordScenes[i+1].word);
    assert.notEqual(wordScenes[i].meaning,wordScenes[i+1].meaning);
    assert.notDeepEqual(wordScenes[i].fragments,wordScenes[i+1].fragments);
  }
  for(const scene of wordScenes){
    assert.equal(scene.options.length,2);
    assert.equal(scene.hints.length,2);
    assert.equal(scene.fragments.filter(fragment=>fragment.clue).length,1);
    assert.ok(scene.options.some(option=>option.id===scene.meaning));
    for(const explanation of Object.values(scene.feedback)) assert.ok(explanation.length>20);
  }
});
test('meaning and evidence explanations distinguish all four combinations',()=>{
  for(let index=0;index<6;index++){
    const game=newWordGame(); selectWordScene(game,index);
    const scene=wordScenes[index];
    for(const meaning of scene.options) for(const fragment of scene.fragments){
      chooseMeaning(game,meaning.id); chooseClue(game,fragment.id); checkWordAnswer(game);
      const feedback=wordFeedback(game);
      assert.ok(feedback.includes(meaning.id===scene.meaning ? scene.feedback.meaningCorrect : scene.feedback.meaningIncorrect));
      assert.ok(feedback.includes(fragment.clue ? scene.feedback.clueCorrect : scene.feedback.clueIncorrect));
      assert.equal(game.scene,index,'checking never advances');
    }
  }
});
test('selections are independent, back navigation preserves answers, new scenes have no hints',()=>{
  const game=newWordGame(); chooseMeaning(game,'seat'); chooseClue(game,'action'); checkWordAnswer(game); showWordHint(game);
  const first={...game.answers[0]};
  selectWordScene(game,1);
  assert.deepEqual(game.answers[1],{meaning:null,clue:null,checked:false,hint:0});
  chooseMeaning(game,'money'); chooseClue(game,'purpose'); checkWordAnswer(game);
  selectWordScene(game,0); assert.deepEqual(game.answers[0],first);
  assert.equal(game.answers[1].meaning,'money');
  chooseMeaning(game,'money'); assert.equal(game.answers[0].checked,false);
  assert.equal(game.answers[1].checked,true);
});
test('invalid navigation and choices cannot corrupt state',()=>{
  const game=newWordGame(), before=structuredClone(game);
  for(const index of [-1,6,1.5,'1',NaN,Infinity,null]) assert.equal(selectWordScene(game,index),false);
  for(const page of ['anything','__proto__',null]) assert.equal(selectWordPage(game,page),false);
  for(const id of ['<script>','__proto__',null,'floor']) assert.equal(chooseMeaning(game,id),false);
  assert.equal(chooseClue(game,'unknown'),false);
  assert.equal(checkWordAnswer(game),false);
  assert.deepEqual(game,before);
  selectWordPage(game,'recall'); assert.equal(chooseMeaning(game,'seat'),false); assert.equal(showWordHint(game),false);
  assert.equal(wordFeedback(game),'');
  selectWordPage(game,'offscreen'); assert.equal(checkWordAnswer(game),false);
});
test('hints have two bounded levels and do not mark answers',()=>{
  const game=newWordGame();
  for(let i=0;i<10;i++) showWordHint(game);
  assert.equal(game.answers[0].hint,2); assert.equal(game.answers[0].meaning,null); assert.equal(game.answers[0].checked,false);
  selectWordScene(game,1); assert.equal(game.answers[1].hint,0);
});
test('feedback never echoes untrusted state or arbitrary stored text',()=>{
  const game=newWordGame(); game.answers[0]={meaning:'<script>bad</script>',clue:'<img>',checked:true,hint:0,message:'injected'};
  assert.doesNotMatch(wordFeedback(game),/<script>|<img>|injected/);
  assert.match(wordFeedback(game),/Falta elegir/);
  for(const bad of [null,{}, {scene:-1},{scene:99},{scene:'0'}, {scene:0,answers:[]}]) assert.equal(wordFeedback(bad),'');
});
test('reset creates independent fresh answers and clears participation and recall',()=>{
  const game=newWordGame(); chooseMeaning(game,'seat'); game.offscreen='tried'; game.recallShown=true; selectWordPage(game,'offscreen');
  resetWordGame(game); assert.deepEqual(game,newWordGame());
  game.answers[0].hint=1;
  assert.equal(game.answers[1].hint,0); assert.equal(newWordGame().answers[0].hint,0);
});
