(() => {
  'use strict';
  const status=document.querySelector('#connection'),button=document.querySelector('#reconnect');
  let room=null,latestInput={dx:0,dy:0},connecting=false,intentional=false;
  const network=window.THUNDER_NETWORK={userId:null,roomId:null,
    input(value){latestInput=value;},
    action(value){if(room)room.send('action',value);},
    menu(){latestInput={dx:0,dy:0};if(room)room.send('input',latestInput);parent.postMessage({type:'magnolia-experience-menu'},new URL(document.referrer).origin);}
  };
  const show=(text,retry=false)=>{status.querySelector('span').textContent=text;status.hidden=false;button.hidden=!retry;};
  async function connect(){
    if(connecting)return;connecting=true;button.hidden=true;show('正在连接合作房间…');
    try{
      const ctx=await Hago.ready();network.userId=ctx.user?.userId;
      if(!network.userId)throw Error('请先在平台登录，再进入游戏。');
      room=ctx.launch.joinCode?await Hago.mp.joinByCode(ctx.launch.joinCode):await Hago.mp.createRoom();
      network.roomId=room.hago.roomId;intentional=false;
      room.onMessage('snapshot',state=>{window.__thunderEngine?.apply(state);status.hidden=true;});
      room.onError((_code,message)=>show(message||'连接异常，请重新进入游戏。',true));
      room.onLeave(()=>{room=null;if(!intentional)show('已断开房间连接，请重新进入游戏。',true);});
      // State subscription is established before requesting the first snapshot.
      room.send('snapshot');
    }catch(error){show(error.message||'房间连接失败，请重试。',true);}
    finally{connecting=false;}
  }
  button.addEventListener('click',()=>location.reload());
  setInterval(()=>{if(room)room.send('input',latestInput);},50);
  addEventListener('pagehide',()=>{intentional=true;room?.leave();});
  addEventListener('load',()=>void connect());
})();
