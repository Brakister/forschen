const {useEffect, useRef, useState} = React;

function useReveal(ref, delay=0){
  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          anime({
            targets: entry.target,
            opacity:[0,1],
            translateY:[36,0],
            easing:'cubicBezier(.16,.8,.24,1)',
            duration:1000,
            delay: delay
          });
          io.unobserve(entry.target);
        }
      });
    },{threshold:.15});
    io.observe(el);
  },[]);
}

function Reveal({children, delay=0, style, className=''}){
  const ref = useRef(null);
  useReveal(ref, delay);
  return <div ref={ref} className={"reveal "+className} style={style}>{children}</div>;
}

function RotatingWord({words, interval=2600}){
  const [i, setI] = useState(0);
  const ref = useRef(null);
  useEffect(()=>{
    const t = setInterval(()=> setI(v => (v+1)%words.length), interval);
    return ()=> clearInterval(t);
  },[words.length, interval]);
  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    el.animate([
      {opacity:0, transform:'perspective(600px) translateY(60%) rotateX(-95deg)'},
      {opacity:1, transform:'perspective(600px) translateY(0) rotateX(0deg)'}
    ], {duration:800, easing:'cubic-bezier(.2,.7,.2,1)', fill:'backwards'});
  },[i]);
  return <em ref={ref} className="rotating-word">{words[i]}</em>;
}

function TitleCard({onDone}){
  useEffect(()=>{
    const tl = anime.timeline({easing:'cubicBezier(.16,.8,.24,1)'});
    tl.add({targets:'.tc-eyebrow', opacity:[0,1], translateY:[10,0], duration:700})
      .add({targets:'.tc-title', opacity:[0,1], letterSpacing:['.5em','.04em'], duration:1100}, '-=300')
      .add({targets:'.letterbox.top', translateY:['0%','-100%'], duration:900, easing:'easeInOutCubic'}, '+=550')
      .add({targets:'.letterbox.bottom', translateY:['0%','100%'], duration:900, easing:'easeInOutCubic'}, '-=900')
      .add({targets:'.titlecard', opacity:[1,0], duration:500, complete: onDone}, '-=400');
  },[]);
  return (
    <div className="titlecard">
      <div className="tc-eyebrow">Apresentamos</div>
      <h1 className="tc-title">FORSCHEN</h1>
    </div>
  );
}

function IntroVideo({onDone}){
  useEffect(()=>{
    anime({targets:'.intro-video', opacity:[0,1], duration:1200, easing:'easeOutQuad'});
    const timer = setTimeout(()=>{
      anime({targets:'.intro-video', opacity:[1,0], duration:800, easing:'easeInOutCubic', complete:onDone});
    }, 3800);
    return ()=> clearTimeout(timer);
  },[]);
  return (
    <div className="intro-video">
      <video autoPlay muted playsInline style={{width:'100%',height:'100%',objectFit:'cover'}}>
        <source src="bombacinne.mp4" type="video/mp4"/>
      </video>
    </div>
  );
}

function Header(){
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(()=>{
    const getScrollY = ()=> window.__virtualScrollY ?? window.scrollY ?? 0;
    const onScroll = ()=> setScrolled(getScrollY() > 40);
    window.addEventListener('scroll', onScroll);
    return ()=> window.removeEventListener('scroll', onScroll);
  },[]);
  return (
    <header className={scrolled? 'scrolled':''}>
      <div className="logo"><span className="logo-mark"></span>FORSCHEN</div>
      <nav className={"links"+(open?' mobile-open':'')} onClick={()=>setOpen(false)}>
        <a href="#sobre">Sobre</a>
        <a href="#engenharia">Engenharia</a>
        <a href="#garantia">Garantia</a>
        <a href="#faq">FAQ</a>
        <a href="#contato">Contato</a>
      </nav>
      <div className="header-right">
        <a href="https://www.instagram.com/forschenbrasil/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="header-ig">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a href="#contato" className="nav-cta" onClick={()=>setOpen(false)}>Solicitar Orçamento</a>
        <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={()=>setOpen(!open)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}

function HeroObject(){
  const objRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = ()=>{
      const w = img.width, h = img.height;
      canvas.width = w; canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const data = ctx.getImageData(0, 0, w, h), d = data.data;
        const N = w * h, bg = new Uint8Array(N), stack = new Int32Array(N);
        let sp = 0;
        const white = i => d[i*4] > 240 && d[i*4+1] > 240 && d[i*4+2] > 240;
        const seed = i => { if(!bg[i] && white(i)){ bg[i]=1; stack[sp++]=i; } };
        for(let y=0;y<h;y++){ seed(y*w); seed(y*w+w-1); }
        for(let x=0;x<w;x++){ seed(x); seed((h-1)*w+x); }
        while(sp>0){
          const i = stack[--sp], x = i%w, y = (i/w)|0;
          if(x>0) seed(i-1);
          if(x<w-1) seed(i+1);
          if(y>0) seed(i-w);
          if(y<h-1) seed(i+w);
        }
        for(let i=0;i<N;i++){
          if(bg[i]){ d[i*4+3]=0; continue; }
          const x=i%w, y=(i/w)|0;
          if((x>0&&bg[i-1])||(x<w-1&&bg[i+1])||(y>0&&bg[i-w])||(y<h-1&&bg[i+w])){
            const m = Math.max(d[i*4], d[i*4+1], d[i*4+2]);
            d[i*4+3] = Math.max(0, Math.min(255, (255-m)*5));
          }
        }
        ctx.putImageData(data, 0, 0);
      } catch(err){}
    };
    img.src = 'bombafor.png';
    return ()=>{ img.onload = null; };
  },[]);

  useEffect(()=>{
    const onMove = (e)=>{
      if(!window.matchMedia('(pointer: fine)').matches) return;
      const x = (e.clientX / window.innerWidth - .5) * 18;
      const y = (e.clientY / window.innerHeight - .5) * 14;
      if(objRef.current){
        objRef.current.style.transform = `translateY(-46%) translate(${x}px, ${y}px) rotate(${x*0.15}deg)`;
      }
    };
    window.addEventListener('mousemove', onMove);
    anime({targets:'.sweep', translateX:['0%','560%'], duration:3400, delay:2200, easing:'easeInOutSine', loop:true, direction:'alternate'});
    return ()=> window.removeEventListener('mousemove', onMove);
  },[]);

  return (
    <div className="hero-object" ref={objRef} id="heroObj">
      <canvas ref={canvasRef} className="hero-canvas hero-bomba"></canvas>
      <div className="sweep"></div>
    </div>
  );
}

function Hero(){
  return (
    <section className="hero">
      <div className="hero-grid-lines"></div>
      <div className="hero-inner">
        <div className="eyebrow" id="heroEyebrow">Aftermarket · Componentes de Performance</div>
          <h1 id="heroTitle">Precisão que se sente<br/>ao <RotatingWord words={["girar a chave.","dar a partida.","ligar o motor.","assumir o volante."]} /></h1>
        <p className="hero-sub" id="heroSub">A FORSCHEN é uma marca internacional especializada no desenvolvimento e fornecimento de componentes automotivos para o mercado de reposição (Aftermarket) — focada em qualidade, precisão e confiabilidade.</p>
        <div className="hero-ctas" id="heroCtas">
          <a href="#engenharia" className="btn-primary">Explorar Componentes →</a>
          <a href="#contato" className="btn-ghost">Solicitar Orçamento</a>
        </div>
      </div>
      <HeroObject/>
      <div className="scroll-cue" id="scrollCue"><span>Role para explorar</span><span className="line"></span></div>
    </section>
  );
}

function About(){
  return (
    <section className="about scroll-block" id="sobre">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Sobre a Marca</div>
          <h2>Desenvolvido para elevar o padrão do mercado de <RotatingWord words={["reposição automotiva.","alta performance.","máxima confiabilidade.","excelência técnica.","inovação contínua."]} /></h2>
        </Reveal>
        <div className="about-grid">
          <Reveal>
            <div className="about-card">
              <div className="tag">Quem Somos</div>
              <h3>Um propósito claro: elevar o padrão.</h3>
              <p>A FORSCHEN nasceu com um propósito claro: elevar o padrão do mercado de reposição automotiva através de componentes desenvolvidos com rigor técnico, processos industriais avançados e controle de qualidade em cada etapa da produção. Com atuação no mercado brasileiro, fornecemos soluções para distribuidores, oficinas especializadas e profissionais que exigem desempenho, segurança e durabilidade.</p>
              <p>Nosso compromisso vai além da fabricação de peças: entregamos confiança.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="about-card dark">
              <div className="tag">Nossa Missão</div>
              <h3>Segurança, desempenho e custo-benefício.</h3>
              <p>Desenvolver componentes automotivos confiáveis que proporcionem segurança, desempenho e excelente custo-benefício para o mercado nacional. Toda peça FORSCHEN passa por rigorosos processos de inspeção, testes dimensionais e validações funcionais antes de chegar ao mercado.</p>
              <p>Os processos de fabricação seguem padrões internacionais de qualidade e são realizados em unidades industriais especializadas, garantindo confiabilidade e desempenho consistente.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProductStage(){
  return (
    <div className="product-stage product-stage-video">
      <video autoPlay loop muted playsInline style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:4}}>
        <source src="pumpcommer.mp4" type="video/mp4"/>
      </video>
    </div>
  );
}

function ProductStory(){
  return (
    <section className="product scroll-block" id="engenharia">
      <div className="wrap">
        <Reveal className="product-top" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:40,marginBottom:64,flexWrap:'wrap'}}>
          <div className="section-head" style={{marginBottom:0}}>
            <div className="eyebrow">Engenharia em Foco</div>
            <h2>Bomba de combustível<br/>de alta performance.</h2>
            <p>Bomba de combustível de precisão, projetada para fluxo constante e pressão controlada — garantindo alimentação eficiente em qualquer condição de uso severo.</p>
          </div>
        </Reveal>
        <Reveal delay={100}><ProductStage/></Reveal>
        <Reveal delay={200}>
          <div className="spec-row">
            <div className="spec-cell"><div className="k">Fluxo</div><div className="v">340 l/h</div></div>
            <div className="spec-cell"><div className="k">Pressão</div><div className="v">3.0 bar</div></div>
            <div className="spec-cell"><div className="k">Tolerância</div><div className="v">±0.02mm</div></div>
            <div className="spec-cell"><div className="k">Acabamento</div><div className="v">Anodizado</div></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const PILLAR_ICON = (children) => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="url(#pillarGrad)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const PILLARS = [
  {icon:PILLAR_ICON(<g><path d="M17 7 V9 M27 17 H25 M7 17 H9 M17 25 V27"/><circle cx="17" cy="17" r="10"/><path d="M17 17 L22 12" stroke="#F3E500"/><circle cx="17" cy="17" r="1.4" fill="#F3E500" stroke="none"/></g>), title:'Engenharia de precisão', text:'Especificações validadas em tolerâncias milimétricas antes de qualquer componente entrar em catálogo.'},
  {icon:PILLAR_ICON(<g><path d="M13 6 h8 v9 l5.5 10 a2.5 2.5 0 0 1 -2.2 3 H9.7 a2.5 2.5 0 0 1 -2.2 -3 L13 15 Z"/><line x1="10.5" y1="22" x2="23.5" y2="22" stroke="#2E7D32"/></g>), title:'Materiais selecionados', text:'Ligas e compostos escolhidos pela resposta ao estresse térmico e mecânico, não pelo menor custo.'},
  {icon:PILLAR_ICON(<g><path d="M17 4 L28 9 v8 c0 7 -4.6 10.8 -11 13 C10.6 27.8 6 24 6 17 V9 Z"/><path d="M12.5 16.5 L16 20 L22.5 13" stroke="#F3E500"/></g>), title:'Durabilidade real', text:'Testado sob condições de uso contínuo — não apenas em laboratório, mas na estrada.'},
  {icon:PILLAR_ICON(<g><polygon points="17,5 25,9.7 25,18.3 17,23 9,18.3 9,9.7"/><circle cx="17" cy="14" r="2.6"/><line x1="13" y1="27" x2="21" y2="27" stroke="#F3E500"/><line x1="14.5" y1="30" x2="19.5" y2="30" stroke="#2E7D32" opacity=".7"/></g>), title:'Confiança de fitment', text:'Compatibilidade verificada por veículo — sem ajustes improvisados ou soluções paliativas.'},
  {icon:PILLAR_ICON(<g><path d="M12 5 h10 v5 a5 5 0 0 1 -10 0 Z"/><path d="M12 7 H8.5 a3 3 0 0 0 2.5 4.5"/><path d="M22 7 h3.5 a3 3 0 0 1 -2.5 4.5"/><line x1="17" y1="15" x2="17" y2="21"/><line x1="12" y1="24" x2="22" y2="24"/><line x1="14.5" y1="28" x2="19.5" y2="28" stroke="#2E7D32"/></g>), title:'Padrão de performance', text:'Cada linha segue critérios técnicos consistentes, do primeiro ao último lote produzido.'},
  {icon:PILLAR_ICON(<g><circle cx="17" cy="17" r="10"/><path d="M17 9 L20.5 17 L17 25 L13.5 17 Z"/><circle cx="17" cy="17" r="1.4" fill="#F3E500" stroke="none"/></g>), title:'Origem rastreável', text:'Procedência clara de cada fornecedor e lote, com documentação técnica disponível.'},
];

function Pillars(){
  return (
    <section className="pillars scroll-block" id="diferenciais">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Por que Forschen</div>
          <h2>Padrões que sustentam<br/>cada componente.</h2>
        </Reveal>
        <div className="pillar-grid">
          <svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="pillarGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F3E500"/>
                <stop offset="1" stopColor="#2E7D32"/>
              </linearGradient>
            </defs>
          </svg>
          {PILLARS.map((p,i)=>(
            <Reveal delay={(i%3)*90} key={i}>
              <div className="pillar">
                {p.icon}
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const VALUES = [
  {title:'Qualidade', text:'Controle de qualidade em cada etapa da produção, com inspeções rigorosas, testes dimensionais e validações funcionais antes de cada peça chegar ao mercado.'},
  {title:'Precisão', text:'Desenvolvimento com rigor técnico e tolerâncias rigorosas, garantindo desempenho consistente e compatibilidade verificada por veículo.'},
  {title:'Confiabilidade', text:'Processos que seguem padrões internacionais de qualidade em unidades industriais especializadas, com origem rastreável em cada lote.'},
];

function Values(){
  return (
    <section className="values scroll-block">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Compromisso</div>
          <h2>Qualidade, precisão<br/>e confiabilidade.</h2>
        </Reveal>
      </div>
      <div className="wrap" style={{padding:0,maxWidth:1360}}>
        <div className="values-inner">
          {VALUES.map((v,i)=>(
            <Reveal delay={i*110} key={i}>
              <div className="value-item">
                <div className="value-num">0{i+1}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const WARRANTY_TOPICS = [
  {title:'Política de garantia', text:'Termos gerais da garantia oferecida pela FORSCHEN para cada linha de produto.'},
  {title:'Procedimentos', text:'Passo a passo para acionar a garantia junto ao ponto de venda ou distribuidor oficial.'},
  {title:'Prazo', text:'Prazos de cobertura conforme o produto e a aplicação.'},
  {title:'Suporte', text:'Canais de atendimento e suporte técnico para dúvidas e assistência.'},
  {title:'Documentação necessária', text:'Documentos exigidos para validação do atendimento de garantia.'},
];

function Warranty(){
  return (
    <section className="warranty scroll-block" id="garantia">
      <div className="wrap warranty-grid">
        <Reveal className="section-head">
          <div className="eyebrow">Garantia</div>
          <h2>Garantia que protege<br/>sua compra.</h2>
          <p>Estamos preparando uma página exclusiva de garantia. Em breve você encontrará aqui todas as informações necessárias, organizadas nos tópicos abaixo.</p>
          <span className="badge">Em breve</span>
        </Reveal>
        <Reveal delay={120}>
          <div className="warranty-list">
            {WARRANTY_TOPICS.map((t,i)=>(
              <div className="w-topic" key={i}>
                <div className="w-num">0{i+1}</div>
                <div className="w-body">
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Distribution(){
  return (
    <section className="distribution scroll-block" id="distribuicao">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Distribuição</div>
          <h2>Onde encontrar<br/>os produtos FORSCHEN.</h2>
          <p>A FORSCHEN conta com parceiros estratégicos em diversos mercados. No Brasil, a distribuição oficial é realizada pela Starke Parts, responsável pela comercialização, suporte comercial e atendimento da marca no território nacional, principalmente na região Sudeste.</p>
        </Reveal>
        <div className="dist-grid">
          <Reveal>
            <div className="dist-card">
              <div className="tag">Distribuidor Oficial</div>
              <div className="dist-logo">STARKE<span>PARTS</span></div>
              <p>Responsável pela comercialização, suporte comercial e atendimento da marca FORSCHEN no Brasil. Confiabilidade de uma distribuição oficial em todo o território nacional.</p>
              <a href="#contato" className="btn-primary">Entrar em Contato →</a>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="dist-card dark">
              <div className="tag">Como Comprar</div>
              <ol className="buy-steps">
                <li><span>01</span> Identifique o componente necessário para o seu veículo.</li>
                <li><span>02</span> Consulte disponibilidade e condições com o distribuidor oficial.</li>
                <li><span>03</span> Receba a peça com garantia e origem rastreável.</li>
              </ol>
              <a href="#contato" className="btn-ghost">Falar com a Starke Parts</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {q:'Quem fabrica a FORSCHEN?', a:'Resposta em breve.'},
  {q:'Onde comprar?', a:'Resposta em breve.'},
  {q:'Como funciona a garantia?', a:'Resposta em breve.'},
  {q:'A peça possui compatibilidade OEM?', a:'Resposta em breve.'},
  {q:'Como identificar produtos originais?', a:'Resposta em breve.'},
  {q:'Onde encontro o catálogo?', a:'Resposta em breve.'},
];

function Faq(){
  const [open, setOpen] = useState(0);
  return (
    <section className="faq scroll-block" id="faq">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">FAQ</div>
          <h2>Perguntas frequentes.</h2>
          <p>Reunimos as principais dúvidas sobre a marca, os produtos e a distribuição.</p>
        </Reveal>
        <div className="faq-list">
          {FAQS.map((it,i)=>(
            <Reveal delay={(i%3)*70} key={i}>
              <div className={"faq-item"+(open===i?' open':'')}>
                <button className="faq-q" onClick={()=>setOpen(open===i?-1:i)} aria-expanded={open===i}>
                  <span>{it.q}</span>
                  <span className="faq-toggle"></span>
                </button>
                <div className="faq-a"><p>{it.a}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <p className="faq-note">Para mais dúvidas, entre em contato pelo formulário abaixo ou acompanhe a FORSCHEN no Instagram.</p>
        </Reveal>
      </div>
    </section>
  );
}

function Contact(){
  const wpp = 'https://wa.me/5511952063102?text=' + encodeURIComponent('Olá! Gostaria de mais informações sobre os produtos FORSCHEN.');
  return (
    <section className="contact scroll-block" id="contato">
      <div className="wrap contact-grid">
        <Reveal className="section-head">
          <div className="eyebrow">Contato</div>
          <h2>Fale com a<br/>FORSCHEN.</h2>
          <p>Fale com um dos nossos especialistas pelo WhatsApp ou acompanhe nossas novidades no Instagram.</p>
          <a className="contact-ig" href="https://www.instagram.com/forschenbrasil/" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            @forschenbrasil
          </a>
        </Reveal>
        <Reveal delay={120}>
          <div className="contact-wa">
            <div className="wa-tag">Atendimento direto</div>
            <h3>Entre em contato com um dos nossos.</h3>
            <p>Nossa equipe atende distribuidores e oficinas. Tire suas dúvidas sobre produtos, garantia e prazos de entrega.</p>
            <a className="btn-primary wa-cta" href={wpp} target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chamar no WhatsApp
            </a>
            <p className="form-note">Resposta rápida em horário comercial.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer(){
  return (
    <footer className="scroll-block">
      <div className="wrap footer-main">
        <div className="logo"><span className="logo-mark"></span>FORSCHEN</div>
        <div className="footer-links">
          <a href="#sobre">Sobre</a><a href="#engenharia">Engenharia</a><a href="#garantia">Garantia</a><a href="#faq">FAQ</a><a href="#contato">Contato</a>
        </div>
        <div className="footer-social">
          <a href="https://www.instagram.com/forschenbrasil/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
        </div>
      </div>
      <div className="wrap footer-note-row">
        <div className="footer-note">© 2026 FORSCHEN — PRECISION ENGINEERED COMPONENTS</div>
        <div className="footer-note">Distribuição oficial no Brasil: Starke Parts</div>
      </div>
    </footer>
  );
}

function Particles(){
  useEffect(()=>{
    const container = document.body;
    const parts = [];
    for(let i=0;i<18;i++){
      const p = document.createElement('div');
      p.className='particle';
      const size = Math.random()*2.5+1;
      p.style.width = size+'px'; p.style.height = size+'px';
      p.style.left = Math.random()*100+'vw';
      p.style.top = Math.random()*100+'vh';
      p.style.opacity = Math.random()*0.4+0.1;
      container.appendChild(p);
      parts.push(p);
      anime({
        targets:p,
        translateY:[0, -(Math.random()*120+60)],
        translateX:[0, (Math.random()*60-30)],
        opacity:[p.style.opacity, 0],
        duration: Math.random()*6000+6000,
        easing:'linear',
        loop:true,
        delay: Math.random()*4000
      });
    }
    return ()=> parts.forEach(p=>p.remove());
  },[]);
  return null;
}

function ProgressBar(){
  const barRef = useRef(null);
  useEffect(()=>{
    const onScroll = ()=>{
      const h = document.documentElement;
      const scrollY = window.__virtualScrollY ?? h.scrollTop;
      const pct = scrollY / (h.scrollHeight - h.clientHeight) * 100;
      if(barRef.current) barRef.current.style.width = pct+'%';
    };
    window.addEventListener('scroll', onScroll);
    return ()=> window.removeEventListener('scroll', onScroll);
  },[]);
  return <div className="progress-track"><div className="progress-bar" ref={barRef}></div></div>;
}

function CustomCursor(){
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const needleRef = useRef(null);

  useEffect(()=>{
    if(!window.matchMedia('(pointer: fine)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const needle = needleRef.current;
    if(!dot || !ring) return;

    const dotS = dot.style;
    const ringS = ring.style;
    const needleS = needle ? needle.style : null;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx, dy = my;
    let rx = mx, ry = my;
    let prevX = mx, prevY = my;
    let speed = 0;
    let frameId;
    let hovering = false;

    const render = ()=>{
      dx += (mx - dx) * 0.5;
      dy += (my - dy) * 0.5;
      rx += (mx - rx) * 0.45;
      ry += (my - ry) * 0.45;

      const sdx = mx - prevX, sdy = my - prevY;
      const s = Math.min(sdx * sdx + sdy * sdy, 6400);
      speed += (s - speed) * 0.12;
      prevX = mx; prevY = my;

      dotS.transform = `translate3d(${dx}px,${dy}px,0)`;
      ringS.transform = `translate3d(${rx}px,${ry}px,0)`;
      if(needleS) needleS.transform = `rotate(${-90 + (speed / 6400) * 180}deg)`;

      frameId = requestAnimationFrame(render);
    };

    const onMove = (e)=>{
      mx = e.clientX;
      my = e.clientY;
      document.documentElement.classList.add('has-custom-cursor');
    };

    const onOver = (e)=>{
      const h = !!(e.target.closest('a,button'));
      if(h !== hovering){
        hovering = h;
        document.documentElement.classList.toggle('cursor-hover', h);
      }
    };

    window.addEventListener('pointermove', onMove, {passive:true});
    window.addEventListener('pointerleave', ()=> document.documentElement.classList.remove('has-custom-cursor'));
    window.addEventListener('pointerdown', ()=> document.documentElement.classList.add('cursor-active'), {passive:true});
    window.addEventListener('pointerup', ()=> document.documentElement.classList.remove('cursor-active'), {passive:true});
    document.addEventListener('mouseover', onOver, {passive:true});
    frameId = requestAnimationFrame(render);

    return ()=>{
      cancelAnimationFrame(frameId);
    };
  },[]);

  return (
    <div className="custom-cursor-layer" aria-hidden="true">
      <div className="cursor-dot-wrap" ref={dotRef}>
        <div className="cursor-dot"></div>
      </div>
      <div className="cursor-ring-wrap" ref={ringRef}>
        <svg className="cursor-tacho" viewBox="0 0 44 44">
          <circle className="tacho-ring" cx="22" cy="22" r="20"/>
          <circle className="tacho-glow" cx="22" cy="22" r="20"/>
          <line className="tacho-tick" x1="2" y1="22" x2="5" y2="22"/>
          <line className="tacho-tick" x1="7.5" y1="10" x2="10" y2="12"/>
          <line className="tacho-tick" x1="17" y1="3" x2="18" y2="6"/>
          <line className="tacho-tick" x1="22" y1="2" x2="22" y2="5"/>
          <line className="tacho-tick" x1="27" y1="3" x2="26" y2="6"/>
          <line className="tacho-tick" x1="36.5" y1="10" x2="34" y2="12"/>
          <line className="tacho-tick" x1="42" y1="22" x2="39" y2="22"/>
          <line ref={needleRef} className="tacho-needle" x1="22" y1="22" x2="22" y2="5"/>
          <circle className="tacho-center" cx="22" cy="22" r="2.5"/>
        </svg>
      </div>
    </div>
  );
}

function App(){
  const [introDone, setIntroDone] = useState(false);
  const [videoDone, setVideoDone] = useState(false);

  useEffect(()=>{
    if(videoDone){
      anime.timeline({easing:'cubicBezier(.16,.8,.24,1)'})
        .add({targets:'#heroEyebrow', opacity:[0,1], translateY:[16,0], duration:700})
        .add({targets:'#heroTitle', opacity:[0,1], translateY:[24,0], duration:900}, '-=500')
        .add({targets:'#heroSub', opacity:[0,1], translateY:[16,0], duration:700}, '-=600')
        .add({targets:'#heroCtas', opacity:[0,1], translateY:[16,0], duration:700}, '-=500')
        .add({targets:'#heroObj', opacity:[0,1], translateX:[40,0], duration:1100}, '-=800')
        .add({targets:'#scrollCue', opacity:[0,1], duration:600}, '-=300');
    }
  },[videoDone]);

  useEffect(()=>{
    const sections = Array.from(document.querySelectorAll('section, footer')).filter(el => !el.classList.contains('hero'));
    if(!sections.length) return;

    sections.forEach(section=>section.classList.add('scroll-block'));

    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting && !entry.target.dataset.entered){
          entry.target.dataset.entered = '1';
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:.18, rootMargin:'0px 0px -8% 0px'});

    sections.forEach(section => io.observe(section));
    return ()=> io.disconnect();
  },[]);

  return (
    <React.Fragment>
      <div className="letterbox top"></div>
      <div className="letterbox bottom"></div>
      {!introDone && !videoDone && <TitleCard onDone={()=>setIntroDone(true)}/>}
      {introDone && !videoDone && <IntroVideo onDone={()=>setVideoDone(true)}/>}
      <div className="grain"></div>
      <div className="vignette"></div>
      <CustomCursor/>
      <ProgressBar/>
      <Particles/>
      <Header/>
      <main className="page-flow">
        <Hero/>
        <About/>
        <ProductStory/>
        <Pillars/>
        <Values/>
        <Warranty/>
        <Distribution/>
        <Faq/>
        <Contact/>
        <Footer/>
      </main>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
