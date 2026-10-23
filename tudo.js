(() => { const src = String.raw`(function () {
const NF = {}; const esp = (ms) => new Promise((r) => setTimeout(r, ms));
NF._frame = () => { const f = document.querySelector('iframe[src*="notaFiscalCompra"]'); if (!f) throw new Error('iframe notaFiscalCompra não encontrado'); return f; };
NF._doc = () => NF._frame().contentDocument; NF._win = () => NF._frame().contentWindow; NF._jq = () => NF._win().jQuery;
NF._clique = (el) => { if (!el) return false; const win = NF._win(); const r = el.getBoundingClientRect(); ['mousedown', 'mouseup', 'click'].forEach((t) => el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: win, clientX: r.left + 5, clientY: r.top + 5 }))); return true; };
NF._dbl = (el) => { const win = NF._win(); const r = el.getBoundingClientRect(); ['mousedown', 'mouseup', 'click', 'dblclick'].forEach((t) => el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: win, clientX: r.left + 5, clientY: r.top + 5 }))); };
NF._setValor = (el, v, kd) => { Object.getOwnPropertyDescriptor(el.ownerDocument.defaultView.HTMLInputElement.prototype, 'value').set.call(el, v); const $ = NF._jq(); if (kd) { $(el).trigger('keydown'); $(el).trigger('keypress'); } $(el).trigger('change'); $(el).trigger('blur'); };
NF.abrirFiltro = () => { const d = NF._doc(); const p = d.querySelector('.panel-group'); if (p && getComputedStyle(p).display === 'none') { const t = d.querySelector('i.icone-direcao'); if (t) t.click(); } };
NF.buscarPorNumero = (n) => { NF.abrirFiltro(); const d = NF._doc(); NF._setValor(d.getElementById('numeroDocumento'), String(n)); d.getElementById('botaoPesquisar').click(); };
NF.abrirNota = (n) => { const t = Array.from(NF._doc().querySelectorAll('#gridNotaFiscalCompra tbody tr[role=row]')).find((r) => r.innerText.includes(String(n))); if (!t) return false; NF._dbl(t.querySelector('td')); return true; };
NF.listarNotasNaGrid = () => Array.from(NF._doc().querySelectorAll('#gridNotaFiscalCompra tbody tr[role=row]')).map((r) => Array.from(r.querySelectorAll('td')).map((td) => td.innerText.trim())).filter((c) => c.some((x) => x));
NF.notasPorEmissao = async (data, f) => { NF.abrirFiltro(); const d = NF._doc(); d.getElementById('botaoLimparFiltros').click(); await esp(800); NF._setValor(d.getElementById('numeroDocumento'), ''); NF._setValor(d.getElementById('dataInicialEmissao'), data); NF._setValor(d.getElementById('dataFinalEmissao'), data); d.getElementById('botaoPesquisar').click(); await esp(3500); const l = NF.listarNotasNaGrid(); return f ? l.filter((c) => c.join(' ').toUpperCase().includes(String(f).toUpperCase())) : l; };
NF.notasPendentes = async (ini, fim) => { NF.abrirFiltro(); const d = NF._doc(); d.getElementById('botaoLimparFiltros').click(); await esp(800); NF._setValor(d.getElementById('numeroDocumento'), ''); NF._setValor(d.getElementById('dataInicialEmissao'), ini); NF._setValor(d.getElementById('dataFinalEmissao'), fim); d.querySelectorAll('input[name="filtro.situacoes[]"]').forEach((cb) => { cb.checked = ['INCONSISTENTE', 'PENDENTE_ENTREGA'].includes(cb.value); }); d.getElementById('botaoPesquisar').click(); await esp(4000); const k = (dt) => dt.split('/').reverse().join(''); const dia = (dt) => { const [a, b, c] = dt.split('/'); return Date.UTC(+c, +b - 1, +a) / 864e5; }; const l = NF.listarNotasNaGrid().map((c) => ({ n: c[11], dt: c[13], f: c[8].slice(0, 28), s: c[15], v: c[25] })); return l.map((x) => { const irm = l.filter((y) => y !== x && y.f === x.f && Math.abs(dia(y.dt) - dia(x.dt)) <= 3); return [x.n, x.dt, x.f, x.s, x.v].join(' | ') + (irm.length ? ' | ⚠ BONIF/DEVOLUÇÃO? mesmo fornecedor: ' + irm.map((y) => y.n + ' ' + y.v).join(', ') : ''); }).sort((a, b) => k(b.split(' | ')[1]).localeCompare(k(a.split(' | ')[1]))); };
NF.lerObservacao = () => Array.from(NF._doc().querySelectorAll('textarea')).map((t) => t.value).filter(Boolean)[0] || '';
NF.preencherOperacao = (c) => NF._setValor(NF._doc().getElementById('codigoDaOperacao'), String(c), true);
NF.fecharDropdowns = () => { const $ = NF._jq(); $('.select2-container--open').each(function () { $(this).find('select').select2('close'); }); };
NF.preencherEntradaHoje = () => { const h = new Date(); NF._setValor(NF._doc().getElementById('dataEntrada'), String(h.getDate()).padStart(2, '0') + '/' + String(h.getMonth() + 1).padStart(2, '0') + '/' + h.getFullYear(), true); };
NF.irParaAba = (n) => { const t = Array.from(NF._doc().querySelectorAll('a')).find((a) => a.offsetParent !== null && a.innerText.trim() === n); if (t) t.click(); return !!t; };
NF.listarItens = () => NF._jq()('#gridProdutos').jqGrid('getRowData').map((r) => ({ seq: r.sequencial, cod: r.codigoDoProduto, desc: r.descricaoDoProduto, un: r.unidadeDoItem, itensUnid: r.quantidadeDeItensNaUnidade, qtd: r.quantidade, emb: r.valorDaEmbalagem }));
NF.abrirItem = (s) => { const row = NF._doc().getElementById('gridProdutos').querySelector('[id="' + s + '"]'); if (!row) return false; NF._dbl(row.querySelector('td')); return true; };
NF.fecharItem = () => { const m = Array.from(NF._doc().querySelectorAll('div')).find((d) => d.offsetParent !== null && /Item de Nota Fiscal/.test(d.innerText || '')); if (!m) return false; return NF._clique(m.querySelector('.k-i-close, [class*="close"]')); };
NF.confirmar = (t) => { t = t || 'Sim'; let b = Array.from(NF._doc().querySelectorAll('button')).find((x) => x.innerText.trim() === t && x.offsetParent !== null); if (!b) b = Array.from(document.querySelectorAll('button')).find((x) => x.innerText.trim() === t && x.offsetParent !== null); return b ? NF._clique(b) : false; };
NF.gravar = () => NF._clique(NF._doc().getElementById('botaoGravar'));
NF.preencherContaAPagarPadrao = () => { const $ = NF._jq(), d = NF._doc(); $('#especieDocumento').select2('open'); $('#especieDocumento').val('1').trigger('change'); const c = d.getElementById('selectCategoria-1'); const o = c ? Array.from(c.options).find((x) => x.text.includes('> 32')) : null; if (o) $('#selectCategoria-1').val(o.value).trigger('change'); const a = d.getElementById('codigoDoAgente'); if (a) NF._setValor(a, '0', true); const p = d.getElementById('percentualCategoria-1'); if (p) NF._setValor(p, '100'); };
NF.gravarContaAPagar = () => NF._clique(NF._doc().getElementById('btn_salvar_contaAPagar'));
NF.abrirReferencia = async (ref) => { const d = NF._doc(); const td = Array.from(d.querySelectorAll('td[aria-describedby="grid_erro"]')).find((e) => e.textContent.includes('"' + ref + '"') && /identificado/i.test(e.textContent)); if (!td) return null; NF._dbl(td); await esp(3000); const m = Array.from(d.querySelectorAll('.modal, [role=dialog]')).filter((e) => e.offsetParent !== null && /Referência do Fornecedor/.test(e.innerText)).pop(); if (!m) return null; const v = (id) => (m.querySelector('#' + id) || {}).value; return { produto: v('codigoDoProduto') + ' ' + v('descricaoDoProduto'), referencia: v('referenciaFornecedor') + ' ' + v('descricaoDaReferencia') }; };
NF.vincularReferencia = async (q) => { const d = NF._doc(), $ = NF._jq(); const m = Array.from(d.querySelectorAll('.modal, [role=dialog]')).filter((e) => e.offsetParent !== null && /Referência do Fornecedor/.test(e.innerText)).pop(); $(m.querySelector('#unidadeDoFornecedor')).val('UN').trigger('change'); const x = m.querySelector('#qtdItensFornecedor'); x.focus(); x.value = String(q || 1); $(x).trigger('keyup').trigger('change').trigger('blur'); await esp(500); NF._clique(m.querySelector('#adicionaReferenciaDoFornecedorAoProduto')); await esp(3000); };
NF.relacionar = async (txt, cod) => { const d = NF._doc(), $ = NF._jq(); const td = Array.from(d.querySelectorAll('td[aria-describedby="grid_erro"]')).find((t) => t.textContent.includes(txt)); if (!td) return 'erro não achado'; NF._dbl(td); await esp(2500); NF.confirmar('Sim'); await esp(3000); const m = Array.from(d.querySelectorAll('.modal, [role=dialog]')).filter((e) => e.offsetParent !== null).pop(); const c = m.querySelector('#codigoDoProduto'); c.focus(); c.value = String(cod); $(c).trigger('keydown').trigger('keyup').trigger('change').trigger('blur'); await esp(2500); const desc = m.querySelector('#descricaoDoProduto').value; await NF.vincularReferencia(1); await esp(1500); if (dialogos().some((x) => /principal/i.test(x))) { NF.confirmar('Não'); await esp(1500); } return desc; };
NF.trocarCfopItens = async (cfop) => { const d = NF._doc(), $ = NF._jq(); const res = []; const mi = () => Array.from(d.querySelectorAll('div')).filter((x) => x.offsetParent !== null && /Item de Nota Fiscal/.test(x.innerText || '') && x.querySelector('input')).pop(); for (const it of NF.listarItens()) { let m = mi(); if (!m || m.querySelector('#sequencial').value !== it.seq) { if (m) { NF.fecharItem(); await esp(1200); } NF.abrirItem(it.seq); await esp(3000); m = mi(); } $('#cfopDoItem').select2('open'); await esp(2000); $('#cfopDoItem').select2('close'); const tem = Array.from(d.getElementById('cfopDoItem').options).some((o) => o.value === String(cfop)); if (tem) $('#cfopDoItem').val(String(cfop)).trigger('change'); await esp(600); NF._clique(m.querySelector('#adicionaItemNaGrid')); await esp(2500); const msgs = Array.from(d.querySelectorAll('.modal, .bootbox')).filter((e) => e.offsetParent !== null && !/Item de Nota Fiscal/.test(e.innerText)).map((e) => e.innerText); if (msgs.some((x) => /Sim/.test(x) && !/sucesso/.test(x))) { NF.confirmar('Sim'); await esp(2000); } if (Array.from(d.querySelectorAll('.modal, .bootbox')).some((e) => e.offsetParent !== null && /sucesso/.test(e.innerText))) { NF.confirmar('Ok'); await esp(1500); } if (mi()) { NF.fecharItem(); await esp(1500); } res.push(it.seq + ':' + (tem ? d.getElementById('cfopDoItem').value : 'sem')); } return res; };
const dialogos = () => Array.from(NF._doc().querySelectorAll('.bootbox')).filter((e) => e.offsetParent !== null).map((e) => e.innerText.replace(/\s+/g, ' ').slice(0, 200)); NF.dialogos = dialogos;
NF._modalItem = () => Array.from(NF._doc().querySelectorAll('div')).filter((x) => x.offsetParent !== null && /Item de Nota Fiscal/.test(x.innerText || '') && x.querySelector('#quantidadeDeItensNaUnidade')).pop();
NF.ultimaCompra = async (s) => { if (NF._modalItem()) { NF.fecharItem(); await esp(1500); } NF.abrirItem(String(s)); await esp(3500); const m = NF._modalItem(); if (!m) return null; const v = (id) => (m.querySelector('#' + id) || {}).value; return { ultQtd: v('quantidadeDaUltimaCompra'), ultValor: v('valorDaUltimaCompra') }; };
NF.setItensUnid = async (s, val) => { let m = NF._modalItem(); if (!m || m.querySelector('#sequencial').value !== String(s)) { if (m) { NF.fecharItem(); await esp(1500); } NF.abrirItem(String(s)); await esp(3500); m = NF._modalItem(); } if (!m) return 'sem modal'; NF._setValor(m.querySelector('#quantidadeDeItensNaUnidade'), String(val)); await esp(500); NF._clique(Array.from(m.querySelectorAll('button, input[type=button]')).find((b) => (b.innerText || b.value || '').trim() === 'Atualizar')); await esp(2500); if (dialogos().some((x) => /Sim/.test(x))) { NF.confirmar('Sim'); await esp(2500); } if (NF._modalItem()) { NF.fecharItem(); await esp(1500); } return (NF.listarItens().find((i) => i.seq === String(s)) || {}).itensUnid; };
NF.setLote = async (l) => { const o = []; for (const [s, v] of l) o.push(s + ':' + await NF.setItensUnid(s, v)); return o; };
NF.gravarNota = async () => { NF.gravar(); await esp(5000); for (let k = 0; k < 3; k++) { const dl = dialogos(); if (!dl.some((x) => /continuar/.test(x))) break; NF.confirmar('Sim'); await esp(5000); } const d = NF._doc(); return { condicao: (d.getElementById('condicaoPagamento') || {}).value, titulos: Array.from(d.querySelectorAll('tr')).filter((r) => r.offsetParent !== null && /\d{2}\/\d{2}\/\d{4}/.test(r.innerText) && /R\$/.test(r.innerText)).map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 60)), dialogos: dialogos() }; };
NF.efetivarEAbrirAjuste = async (manter) => { if (!manter) { NF.preencherContaAPagarPadrao(); await esp(1500); } NF.gravarContaAPagar(); await esp(4000); if (dialogos().some((x) => /efetiva/.test(x))) NF.confirmar('Sim'); let dl = []; for (let i = 0; i < 40; i++) { await esp(1500); dl = dialogos(); if (dl.some((x) => /ajuste de pre/i.test(x))) break; if (dl.some((x) => /sucesso|já utilizado/i.test(x))) NF.confirmar('Ok'); } if (!dl.some((x) => /ajuste de pre/i.test(x))) return { erro: 'sem ajuste', dl }; NF.confirmar('Sim'); await esp(8000); const t = NF._doc().body.innerText.replace(/\s+/g, ' '); const i = t.indexOf('Produtos Custos'); return { grid: i < 0 ? null : t.slice(i + 120).replace(/TIPO 2.*?(?=\d{14} -|$)/g, '| ').replace(/0000000+/g, '').slice(0, 4000) }; };
NF.fecharAjusteSemGravar = async () => { NF._clique(NF._doc().getElementById('btn_cancelar')); await esp(2000); if (dialogos().some((x) => /Sim/.test(x))) { NF.confirmar('Sim'); await esp(2000); } };
NF.lista = async () => { location.hash = '#/vf?r=%2FnotaFiscalCompra%2Findex%3Ft%3D' + Date.now(); await esp(8000); };
NF.reavaliar = async () => { NF._clique(NF._doc().getElementById('valida')); for (let i = 0; i < 16 && !NF._doc().getElementById('gridProdutos'); i++) await esp(1500); await esp(3000); return !!NF._doc().getElementById('gridProdutos'); };
NF.erros = () => Array.from(NF._doc().querySelectorAll('td[aria-describedby="grid_erro"]')).map((t) => t.textContent.trim().slice(0, 140));
NF.vincularRefsEAN = async () => { const out = []; for (let k = 0; k < 30; k++) { const td = Array.from(NF._doc().querySelectorAll('td[aria-describedby="grid_erro"]')).find((t) => /identificado pelo ean/i.test(t.textContent)); if (!td) break; const ref = (td.textContent.match(/fornecedor "([^"]+)"/i) || [])[1]; const a = await NF.abrirReferencia(ref); if (!a) { out.push(ref + ' sem modal'); break; } await NF.vincularReferencia(1); await esp(1500); if (dialogos().some((x) => /principal/i.test(x))) { NF.confirmar('Não'); await esp(1500); } const p = Array.from(NF._doc().querySelectorAll('.modal,[role=dialog]')).filter((e) => e.offsetParent !== null && /Pesquisa/.test(e.innerText)).pop(); if (p) { const r = Array.from(p.querySelectorAll('tbody tr')).find((x) => x.offsetParent !== null && x.innerText.trim()); if (r) { NF._dbl(r.querySelector('td')); await esp(2500); } } out.push(ref + ': ' + a.produto); } return out; };
NF.urlsNovos = async () => { const w = NF._win(); const urls = []; w.open = (u) => { urls.push(u); return null; }; const alvo = () => Array.from(NF._doc().querySelectorAll('td[aria-describedby="grid_erro"]')).filter((t) => /n[ãa]o configurado em produto/i.test(t.textContent) && !/identificado/i.test(t.textContent)); const n = alvo().length; const nomes = []; for (let k = 0; k < n; k++) { const td = alvo()[k]; if (!td) break; nomes.push(td.textContent.slice(0, 90)); NF._dbl(td); await esp(2500); NF.confirmar('Não'); await esp(2500); NF.confirmar('Ok'); await esp(2000); } return nomes.map((x, i) => [(urls[i] || '').split('idItemNota=')[1], x]); };
NF.preencherPrincipal = async (op) => { op = String(op || '1'); const $ = NF._jq(); NF.irParaAba('Principal'); await esp(1500); NF.preencherOperacao(op); await esp(2500); $('#cfopDaNota').select2('open'); await esp(3000); NF.fecharDropdowns(); $('#local').select2('open'); await esp(2500); NF.fecharDropdowns(); $('#cfopDaNota').val({ '1': '1403', '5': '1910', '11': '1202' }[op] || '1403').trigger('change'); $('#local').val('1').trigger('change'); NF.fecharDropdowns(); await esp(800); NF.preencherEntradaHoje(); await esp(1500); NF.irParaAba('Itens'); await esp(3000); return $('#cfopDaNota').val(); };
NF.itensComUlt = async () => { const out = []; for (const it of NF.listarItens()) { const u = await NF.ultimaCompra(it.seq); out.push([it.seq, it.cod, it.desc.slice(0, 40), 'iu ' + it.itensUnid, 'qtd ' + it.qtd, it.emb, u && u.ultQtd ? u.ultQtd + '@' + u.ultValor : ''].join('|')); } if (NF._modalItem()) NF.fecharItem(); return out; };
NF.prepararNota = async (n, op, rapido) => { NF.buscarPorNumero(n); await esp(4000); if (!NF.abrirNota(n)) return { erro: 'não achada' }; await esp(8000); if (!NF._doc().getElementById('gridProdutos')) return { erros: NF.erros() }; const c = NF.lerObservacao(); const m = c.match(/.{0,60}(BONIF|BNF|DEVOLU|VENCIMENTO|COND|PAG|PRAZO|SOMENTE).{0,100}/i); await NF.preencherPrincipal(op); const obs = (/BONIF|BNF/i.test(c) ? '⚠ BONIFICAÇÃO NA OBS: ' : '') + (m ? m[0] : c.slice(0, 120)); if (rapido) return { obs, itens: NF.listarItens().map((it) => [it.seq, it.cod, it.desc.slice(0, 40), 'iu ' + it.itensUnid, 'qtd ' + it.qtd, it.emb].join('|')) }; return { obs, itens: await NF.itensComUlt() }; };
NF.ultLote = async (seqs) => { const out = []; for (const s of seqs) { const u = await NF.ultimaCompra(s); out.push(s + ':' + (u && u.ultQtd ? u.ultQtd + '@' + u.ultValor : '-')); } if (NF._modalItem()) NF.fecharItem(); return out; };
NF.aVista = async () => { const d = NF._doc(), $ = NF._jq(); $('#condicaoPagamento').val('A_PRAZO').trigger('change'); await esp(800); $('#condicaoPagamento').val('A_VISTA').trigger('change'); await esp(1500); NF.preencherContaAPagarPadrao(); await esp(1500); NF._clique(d.getElementById('gerarTitulos')); await esp(2500); return Array.from(d.querySelectorAll('tr')).filter((r) => r.offsetParent !== null && /R\$/.test(r.innerText)).map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 60)); };
NF.titulos = async (n, venc) => { const d = NF._doc(); NF.preencherContaAPagarPadrao(); await esp(1500); NF._setValor(d.getElementById('numeroDeTitulos'), String(n), true); if (venc) NF._setValor(d.getElementById('vencimento'), venc, true); await esp(800); NF._clique(d.getElementById('gerarTitulos')); await esp(2500); return { dl: dialogos(), t: Array.from(d.querySelectorAll('tr')).filter((r) => r.offsetParent !== null && /R\$/.test(r.innerText)).map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 60)) }; };
NF.fecharConta = async () => { const m = Array.from(NF._doc().querySelectorAll('.modal')).filter((e) => e.offsetParent !== null && /Conta a Pagar/.test(e.innerText)).pop(); if (m) { NF._clique(m.querySelector('.close')); await esp(2500); } if (dialogos().length) { NF.confirmar('Ok'); await esp(1500); } };
NF.lancarBonificada = async () => { await NF.preencherPrincipal('5'); NF.abrirItem(NF.listarItens()[0].seq); await esp(4000); const cf = await NF.trocarCfopItens('1910'); await esp(1500); await NF.gravarNota(); if (dialogos().some((x) => /efetiva/.test(x))) NF.confirmar('Sim'); let dl = []; for (let i = 0; i < 25; i++) { await esp(1500); dl = dialogos(); if (dl.some((x) => /ajuste de pre/i.test(x))) break; if (dl.some((x) => /sucesso/i.test(x))) NF.confirmar('Ok'); } if (dl.some((x) => /ajuste de pre/i.test(x))) { NF.confirmar('Não'); await esp(2000); } return { cf, fim: dl }; };
NF.lerNotaEfetivada = async (numero, emissao, filtro) => { await NF.notasPorEmissao(emissao, filtro); const doc = NF._doc(); const row = Array.from(doc.querySelectorAll('#gridNotaFiscalCompra tbody tr[role=row]')).find((r) => r.innerText.includes(String(numero))); if (!row) return 'não achei'; NF._clique(row.querySelector('td')); await esp(800); NF._clique(Array.from(doc.querySelectorAll('button')).find((x) => x.innerText.trim() === 'Ajustar Preço')); await esp(8000); const t = NF._doc().body.innerText.replace(/\s+/g, ' '); const i = t.indexOf('Produtos Custos'); const res = i < 0 ? t.slice(0, 300) : t.slice(i + 120).replace(/TIPO 2.*?(?=\d{14} -|$)/g, '| ').replace(/0000000+/g, '').slice(0, 5000); NF._clique(NF._doc().getElementById('btn_cancelar')); await esp(2000); if (dialogos().some((x) => /Sim/.test(x))) { NF.confirmar('Sim'); await esp(2000); } return res; };
NF.itensEfetivada = async (numero, emissao, filtro) => { await NF.notasPorEmissao(emissao, filtro); const g = NF._jq()(NF._doc().getElementById('gridNotaFiscalCompra')).data('kendoGrid'); const it = g.dataSource.data().find((x) => JSON.stringify(x).includes(String(numero))); if (!it) return 'não achei'; const h = await (await fetch('/notaFiscalCompra/visualiza/' + it.codigo)).text(); return h.split('myDataItens.push({').slice(1).map((b) => { const v = (k) => (b.match(new RegExp(k + ':\\s*"([^"]*)"')) || [])[1]; return [v('sequencial'), v('codigoDoProduto'), (v('descricaoDoProduto') || '').slice(0, 30), 'iu ' + v('quantidadeDeItensNaUnidade'), 'q ' + v('quantidade'), v('valorDaEmbalagem'), v('valorTotalDoItem')].join('|'); }); };
window.NF = NF;
})();
window.bg = (fn) => { window._bg = { done: false }; Promise.resolve().then(fn).then((r) => { window._bg = { done: true, r }; }, (e) => { window._bg = { done: true, r: 'ERRO ' + e }; }); return 'iniciado'; };
window.esperarBg = async (s) => { for (let i = 0; i < (s || 25) && !(window._bg && window._bg.done); i++) await new Promise((r) => setTimeout(r, 1000)); return window._bg && window._bg.done ? window._bg.r : 'rodando'; };
'NF ok';
(function () {
const CAD = {};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
CAD._frame = function () {
const f = Array.from(document.querySelectorAll('iframe')).find((x) => x.src.includes('/produto/cadastro'));
if (!f) throw new Error('iframe de cadastro de produto não encontrado');
return f;
};
CAD._doc = () => CAD._frame().contentDocument;
CAD._win = () => CAD._frame().contentWindow;
CAD._jq = () => CAD._win().jQuery;
CAD._clique = function (el, dbl) {
const w = CAD._win();
const rc = el.getBoundingClientRect();
const tipos = dbl ? ['mousedown', 'mouseup', 'click', 'dblclick'] : ['mousedown', 'mouseup', 'click'];
tipos.forEach((t) => el.dispatchEvent(new w.MouseEvent(t, { bubbles: true, cancelable: true, view: w, clientX: rc.left + 5, clientY: rc.top + 5 })));
};
CAD._modal = () => Array.from(CAD._doc().querySelectorAll('.modal, [role=dialog]')).filter((e) => e.offsetParent !== null).pop();
CAD._aba = function (nome) {
const a = Array.from(CAD._doc().querySelectorAll('a')).find((x) => x.offsetParent !== null && x.innerText.trim() === nome);
a.click();
};
CAD._select = async function (id, valor) {
const $ = CAD._jq();
const el = CAD._doc().getElementById(id);
if (el.options.length <= 1 && $('#' + id).data('select2')) {
$('#' + id).select2('open'); await espera(1800); $('#' + id).select2('close');
}
$('#' + id).val(valor).trigger('change');
await espera(600);
return (el.options[el.selectedIndex] || {}).text;
};
CAD.cadastrarPadrao = async function (secao) {
const d = CAD._doc();
const $ = CAD._jq();
const r = {};
secao = String(parseInt(secao, 10)); // select usa "1", não "01" (senão Seção fica vazia e o Gravar falha calado)
r.codigo = d.getElementById('codigo').value;
r.descricao = d.getElementById('descricao').value;
r.secao = await CAD._select('secao', String(secao));
const pd = d.getElementById('permiteDesconto'); if (pd && !pd.checked) { pd.click(); $(pd).trigger('change'); }
r.unCompra = await CAD._select('unidadeDeCompra', 'UN');
r.unVenda = await CAD._select('unidadeDeVenda', 'UN');
CAD._aba('Impostos'); await espera(1200);
r.ncm = d.getElementById('codigoNomeclaturaMercosul').value + ' ' + d.getElementById('descricaoNomeclaturaMercosul').value;
r.cest = (d.getElementById('comboCest').options[d.getElementById('comboCest').selectedIndex] || {}).text;
const sf = d.getElementById('codigoDaSituacaoFiscal');
sf.value = '1'; $(sf).trigger('keydown').trigger('keyup').trigger('change').trigger('blur');
await espera(1800);
r.situacaoFiscal = d.getElementById('descricaoDaSituacaoFiscal').value;
CAD._clique(d.getElementById('adicionarRegime')); await espera(2000);
await CAD._select('lojaRegime', '1'); await espera(1200);
await CAD._select('regimeProduto', '3');
CAD._clique(d.getElementById('adicionaRegime')); await espera(1800);
for (const sigla of ['PIS', 'COFINS']) {
CAD._clique(d.getElementById('adicionaImpostoFederal')); await espera(2000);
let m = CAD._modal();
CAD._clique(m.querySelector('#btnPopupPesquisaImpostoFederal')); await espera(2000);
m = CAD._modal();
const row = Array.from(m.querySelectorAll('tbody tr')).find((x) => x.offsetParent !== null && new RegExp('\\b' + sigla + '\\b').test(x.innerText));
if (row) { CAD._clique(row.querySelector('td')); await espera(400); CAD._clique(d.getElementById('adicionarNovoImposto')); await espera(1800); }
m = CAD._modal();
if (m) { const x = m.querySelector('.close'); if (x) CAD._clique(x); await espera(800); }
}
CAD._clique(d.getElementById('pesquisaDeNatureza')); await espera(2200);
let m = CAD._modal();
const cod = m.querySelector('[name="naturezaDeImpostoFederal.codigo"]');
cod.value = '409'; $(cod).trigger('change');
CAD._clique(m.querySelector('#botaoPesquisarPopup')); await espera(2200);
const n409 = m.querySelector('tbody tr[id="409"]');
if (n409) { CAD._clique(n409.querySelector('td')); await espera(400); CAD._clique(m.querySelector('#selecionarPopupPesquisa')); await espera(1800); }
r.natureza = d.getElementById('codigoDaNatureza').value;
const txt = d.body.innerText.replace(/\n\s*\n/g, '\n');
r.regime = /ERBENE CHAVES SOUSA ME\s+3 - ALIQUOTA EFETIVA/i.test(txt);
r.pis = /\bPIS\s+PIS 98/.test(txt.replace(/\t/g, ' '));
r.cofins = /\bCOFINS\s+COFINS 98/.test(txt.replace(/\t/g, ' '));
CAD._aba('Fornecedor'); await espera(1200);
const linha = Array.from(d.querySelectorAll('tr')).find((x) => x.offsetParent !== null && /^\d+ - /.test(x.innerText.trim()) && x.querySelector('td'));
if (linha) {
CAD._clique(linha.querySelector('td'), true); await espera(2200);
await CAD._select('unidadeDoFornecedor', 'UN');
r.qtdItensFornecedor = d.getElementById('qtdItensFornecedor').value;
CAD._clique(d.getElementById('adicionaItemDeFornecedorNaGrid')); await espera(1800);
r.fornecedor = linha.innerText.replace(/\s+/g, ' ').trim();
}
return r;
};
CAD.gravar = async function () {
const d = CAD._doc();
CAD._clique(d.getElementById('botaoGravar')); await espera(4000);
return Array.from(d.querySelectorAll('.modal, .bootbox, [role=dialog]')).filter((e) => e.offsetParent !== null).map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300));
};
CAD.gravarComCorrecao = async function () {
const d = CAD._doc(), $ = CAD._jq(); const passos = [];
const fecharOk = async () => { const ok = Array.from(d.querySelectorAll('.modal button, .bootbox button')).find((b) => b.offsetParent !== null && b.innerText.trim() === 'Ok'); if (ok) CAD._clique(ok); await espera(800); };
const natureza409 = async () => {
CAD._aba('Impostos'); await espera(1200); if (d.getElementById('codigoDaNatureza').value === '409') return;
CAD._clique(d.getElementById('pesquisaDeNatureza')); await espera(2200); const m = CAD._modal();
const cod = m.querySelector('[name="naturezaDeImpostoFederal.codigo"]'); cod.value = '409'; $(cod).trigger('change');
CAD._clique(m.querySelector('#botaoPesquisarPopup')); await espera(2200);
const n = m.querySelector('tbody tr[id="409"]'); if (n) { CAD._clique(n.querySelector('td')); await espera(400); CAD._clique(m.querySelector('#selecionarPopupPesquisa')); await espera(1800); }
};
for (let k = 0; k < 3; k++) {
const g = await CAD.gravar(); passos.push(g.join(' | ').slice(0, 80));
if (g.some((x) => /sucesso/i.test(x))) return passos;
await fecharOk();
if (g.some((x) => /CEST/i.test(x))) {
CAD._aba('Impostos'); await espera(1200); const ncm = d.getElementById('codigoNomeclaturaMercosul').value;
CAD._clique(d.getElementById('pesquisaNomeclaturaMercosul')); await espera(2500); let m = CAD._modal();
const p = Array.from(m.querySelectorAll('button,input[type=button]')).find((b) => /Pesquisar/i.test(b.innerText || b.value)); if (p) { CAD._clique(p); await espera(2500); }
m = CAD._modal(); const row = m.querySelector('tbody tr[id="' + ncm + '"]') || Array.from(m.querySelectorAll('tbody tr')).find((r) => r.offsetParent !== null && r.id);
CAD._clique(row.querySelector('td')); await espera(400); CAD._clique(m.querySelector('#selecionarPopupPesquisa')); await espera(2500);
await natureza409(); continue;
}
if (g.some((x) => /natureza/i.test(x))) { await natureza409(); continue; }
return passos;
}
return passos;
};
CAD.marcarPeso = async function () {
const d = CAD._doc(), $ = CAD._jq(); CAD._aba('Principal'); await espera(1500);
const cod = d.getElementById('codigo').value; const desc = d.getElementById('descricao');
if (!desc.value.trim().endsWith(' ' + cod)) { desc.value = desc.value.trim() + ' ' + cod; $(desc).trigger('change').trigger('blur'); }
const rad = Array.from(d.querySelectorAll('input[name="produto.pesoVariavel"]')).find((c) => c.value === 'SIM'); CAD._clique(rad); rad.checked = true; $(rad).trigger('change'); await espera(800);
return { desc: desc.value, peso: Array.from(d.querySelectorAll('input[name="produto.pesoVariavel"]')).filter((c) => c.checked).map((c) => c.value) };
};
CAD.cadastrarLote = async function (lista) {
const out = [];
for (const [n, s, op] of lista) {
try {
location.hash = '/vf?r=/produto/cadastro/novo&p=idItemNota=' + n + '&t=' + Date.now(); await espera(9000);
const r = await CAD.cadastrarPadrao(s); let pz = null; if (op && op.peso) pz = await CAD.marcarPeso();
const g = await CAD.gravarComCorrecao();
out.push({ cod: CAD._doc().getElementById('codigo').value, desc: (pz && pz.desc) || r.descricao, secao: r.secao, ok: g.some((x) => /sucesso/i.test(x)), g: g.join('|').slice(-60) });
} catch (e) { out.push({ n, erro: String(e) }); }
}
return out;
};
window.CAD = CAD;
})();
(function () {
const esp = (ms) => new Promise((r) => setTimeout(r, ms));
window.PROD = {
f: () => document.querySelector('iframe[src*="produto"]'),
clique(w, el, dbl) { const rc = el.getBoundingClientRect(); (dbl ? ['mousedown', 'mouseup', 'click', 'dblclick'] : ['mousedown', 'mouseup', 'click']).forEach((t) => el.dispatchEvent(new w.MouseEvent(t, { bubbles: true, cancelable: true, view: w, clientX: rc.left + 5, clientY: rc.top + 5 }))); },
async abrir(cod) {
let f = PROD.f(), d = f.contentDocument, w = f.contentWindow, $ = w.jQuery;
d.getElementById('codigo').value = String(cod); $('#codigo').trigger('change'); d.getElementById('botaoPesquisar').click();
const primeira = (r) => Array.from(r.querySelectorAll('td')).find((t) => t.innerText.trim());
let row; for (let i = 0; i < 15 && !row; i++) { await esp(1000); row = Array.from(d.querySelectorAll('table tbody tr[role=row]')).find((r) => { const t = primeira(r); return t && t.innerText.trim() === String(cod); }); }
if (!row) throw new Error('não achei ' + cod);
PROD.clique(w, primeira(row), true);
for (let i = 0; i < 20; i++) { await esp(1000); f = PROD.f(); d = f.contentDocument; if (d.getElementById('gridFornecedor') && d.getElementById('codigo').value === String(cod) && d.getElementById('descricao').value) break; }
await esp(1500); f = PROD.f(); d = f.contentDocument;
Array.from(d.querySelectorAll('a')).find((a) => a.offsetParent !== null && a.innerText.trim() === 'Fornecedor').click(); await esp(1500);
return PROD.listar();
},
listar() {
const d = PROD.f().contentDocument;
return { cod: d.getElementById('codigo').value, desc: d.getElementById('descricao').value, fornecedores: Array.from(d.querySelectorAll('tr')).filter((r) => r.offsetParent !== null && r.querySelector('td') && /^\d+ - /.test(r.innerText.trim())).map((r) => r.innerText.replace(/\s+/g, ' ').trim()) };
},
async qtdItensFornecedor(txt, valor) {
const f = PROD.f(), d = f.contentDocument, w = f.contentWindow, $ = w.jQuery;
const row = Array.from(d.querySelectorAll('tr')).find((r) => r.offsetParent !== null && r.querySelector('td') && r.innerText.toUpperCase().includes(txt.toUpperCase())); if (!row) return 'fornecedor não encontrado';
PROD.clique(w, row.querySelector('td'), true); await esp(2500);
const q = d.getElementById('qtdItensFornecedor'); q.focus(); q.value = String(valor); $(q).trigger('keyup').trigger('change').trigger('blur'); await esp(500);
PROD.clique(w, d.getElementById('adicionaItemDeFornecedorNaGrid')); await esp(2000); return PROD.listar();
},
async gravar() {
const f = PROD.f(), d = f.contentDocument, w = f.contentWindow; PROD.clique(w, d.getElementById('botaoGravar')); await esp(4000);
return Array.from(d.querySelectorAll('.modal, .bootbox, [role=dialog]')).filter((e) => e.offsetParent !== null).map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200));
},
async gravarCompleto() {
const g = await PROD.gravar(); if (!g.some((x) => /natureza de imposto federal/i.test(x))) return g;
const f = PROD.f(), d = f.contentDocument, w = f.contentWindow, $ = w.jQuery; const ck = (el) => PROD.clique(w, el);
const ok = Array.from(d.querySelectorAll('.modal button, .bootbox button')).find((b) => b.offsetParent !== null && b.innerText.trim() === 'Ok'); if (ok) ck(ok); await esp(1000);
Array.from(d.querySelectorAll('a')).find((a) => a.offsetParent !== null && a.innerText.trim() === 'Impostos').click(); await esp(1500);
const sel = async (id, v) => { if (d.getElementById(id).options.length <= 1 && $('#' + id).data('select2')) { $('#' + id).select2('open'); await esp(1800); $('#' + id).select2('close'); } $('#' + id).val(v).trigger('change'); await esp(600); };
const modal = () => Array.from(d.querySelectorAll('.modal, [role=dialog]')).filter((e) => e.offsetParent !== null).pop();
if (!/3 - ALIQUOTA EFETIVA/i.test(d.body.innerText)) {
ck(d.getElementById('adicionarRegime')); await esp(2000); await sel('lojaRegime', '1'); await esp(1200); await sel('regimeProduto', '3'); ck(d.getElementById('adicionaRegime')); await esp(1800);
}
if (d.getElementById('codigoDaNatureza').value !== '409') {
ck(d.getElementById('pesquisaDeNatureza')); await esp(2200); const m = modal();
const cod = m.querySelector('[name="naturezaDeImpostoFederal.codigo"]'); cod.value = '409'; $(cod).trigger('change');
ck(m.querySelector('#botaoPesquisarPopup')); await esp(2200);
const n = m.querySelector('tbody tr[id="409"]'); if (n) { ck(n.querySelector('td')); await esp(400); ck(m.querySelector('#selecionarPopupPesquisa')); await esp(1800); }
}
return ['(completou Regime/Natureza)'].concat(await PROD.gravar());
},
async qtdLote(lista, fornTxt) {
const out = [];
for (const [c, v] of lista) {
try {
location.hash = '#/vf?r=%2Fproduto%2Fcadastro%3Ft%3D' + Date.now(); await esp(7000);
const l = await PROD.abrir(c); const f = l.fornecedores.filter((x) => x.toUpperCase().includes(fornTxt.toUpperCase()));
if (f.length !== 1) { out.push(c + ' PULEI: ' + f.length + ' linhas ' + fornTxt + ' ' + f.join(' || ')); continue; }
const un = (f[0].match(/ (UN|CX|FD|PCT|KG|DP|SC|L|LT|GRS|M|MIL) /) || [])[1];
if (!/^(UN|CX|FD|PCT|DP)$/.test(un || '')) { out.push(c + ' PULEI: unidade ' + un); continue; }
if (new RegExp(' ' + v + '(,000)? ').test(f[0])) { out.push(c + ' já ' + v); continue; }
const a = await PROD.qtdItensFornecedor(fornTxt, v); const g = await PROD.gravarCompleto();
out.push(c + ' → ' + v + ' ' + (g.some((x) => /sucesso/i.test(x)) ? 'OK' : g.join('|').slice(-60)));
} catch (e) { out.push(c + ' erro ' + e); }
}
return out;
},
};
})();
(function () {
window.FAM = {
espera: (ms) => new Promise((r) => setTimeout(r, ms)),
botao(txt, ultimo) {
const b = Array.from(document.querySelectorAll('button')).filter((x) => x.offsetParent !== null && x.innerText.trim() === txt);
return ultimo ? b[b.length - 1] : b[0];
},
clicar(el) {
const r = el.getBoundingClientRect();
['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((t) => el.dispatchEvent(new (t.startsWith('pointer') ? PointerEvent : MouseEvent)(t, { bubbles: true, cancelable: true, view: window, clientX: r.left + 10, clientY: r.top + 10 })));
},
focarDescricao() {
const i = Array.from(document.querySelectorAll('main input[type=text]')).find((x) => x.offsetParent !== null);
i.focus(); i.select(); return !!i;
},
async abrirPainelEFocar() {
FAM.clicar(FAM.botao('Adicionar produtos')); await FAM.espera(1500);
const lab = Array.from(document.querySelectorAll('*')).find((e) => e.children.length === 0 && /Buscar produto/.test(e.textContent));
let p = lab, inp = null;
for (let k = 0; k < 5 && p; k++) { p = p.parentElement; inp = p && p.querySelector('input'); if (inp) break; }
if (!inp) return false;
inp.focus(); inp.select(); return document.activeElement === inp;
},
resultado() {
const t = document.body.innerText; const i = t.lastIndexOf('Resultado');
return i < 0 ? '' : t.slice(i, i + 300).replace(/\s+/g, ' ');
},
async marcarCodigo(cod) {
const el = Array.from(document.querySelectorAll('*')).find((e) => e.children.length === 0 && e.textContent.trim() === String(cod) && e.closest('[id^="table-busca-produtos"], table'));
let q = el, cb = null;
for (let k = 0; k < 8 && q; k++) { q = q.parentElement; cb = q && q.querySelector('.shr-checkbox'); if (cb) break; }
if (!cb) return false;
cb.querySelector('.shr-checkbox__label').click(); await FAM.espera(500);
return !!cb.querySelector('.--checked');
},
async salvarPainel() { FAM.botao('Salvar', true).click(); await FAM.espera(6000); },
lista(nome) { return (document.body.innerText.split('Produtos / ' + nome)[1] || '').split('Voltar')[0].replace(/\s+/g, ' '); },
async salvarFamilia() { FAM.botao('Salvar').click(); await FAM.espera(3500); return location.href; },
digitar(inp, txt) { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; inp.focus(); setter.call(inp, txt); inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' })); inp.dispatchEvent(new Event('change', { bubbles: true })); },
inputBusca() { const lab = Array.from(document.querySelectorAll('*')).find((e) => e.children.length === 0 && /Buscar produto/.test(e.textContent)); let p = lab, inp = null; for (let k = 0; k < 5 && p; k++) { p = p.parentElement; inp = p && p.querySelector('input'); if (inp) break; } return inp; },
async criar(nome, buscas) {
const log = []; const desc = Array.from(document.querySelectorAll('main input[type=text]')).find((x) => x.offsetParent !== null); FAM.digitar(desc, nome); await FAM.espera(600);
FAM.botao('Próximo').click(); await FAM.espera(2500);
if (!document.body.innerText.includes('Produtos / ' + nome)) return { erro: 'nao avancou', log };
for (const b of buscas) {
await FAM.abrirPainelEFocar(); FAM.digitar(FAM.inputBusca(), b.q); await FAM.espera(3000);
const marc = {}; for (const c of b.cods) marc[c] = await FAM.marcarCodigo(c);
log.push({ q: b.q, res: FAM.resultado().slice(0, 60), marc });
if (Object.values(marc).some(Boolean)) await FAM.salvarPainel(); else await FAM.espera(6000);
}
const lista = FAM.lista(nome); const todos = buscas.flatMap((b) => b.cods);
const faltam = todos.filter((c) => !new RegExp('\\b' + c + '\\b').test(lista));
let url = null; if (!faltam.length) url = await FAM.salvarFamilia();
return { log, lista, faltam, url };
},
async adicionar(cods) {
FAM.botao('Próximo').click(); await FAM.espera(2500); const nome = (document.body.innerText.match(/Produtos \/ ([^\n]+)/) || [])[1]; const antes = FAM.lista(nome);
const log = []; for (const c of cods) { await FAM.abrirPainelEFocar(); FAM.digitar(FAM.inputBusca(), c); await FAM.espera(3000); const m = await FAM.marcarCodigo(c); log.push(c + ':' + m); if (m) await FAM.salvarPainel(); else await FAM.espera(6000); }
const lista = FAM.lista(nome); const faltam = cods.filter((c) => !new RegExp('\\b' + c + '\\b').test(lista)); let url = null; if (!faltam.length) url = await FAM.salvarFamilia();
return { nome, antes, lista, log, faltam, url };
},
async nova(nome, cods, qNome) {
location.hash = '#/familiaProdutos'; await FAM.espera(3000); location.hash = '#/familiaProdutos/cadastro'; await FAM.espera(5000);
const desc = Array.from(document.querySelectorAll('main input[type=text]')).find((x) => x.offsetParent !== null); FAM.digitar(desc, nome); await FAM.espera(600);
FAM.botao('Próximo').click(); await FAM.espera(2500);
if (!document.body.innerText.includes('Produtos / ' + nome)) return { erro: 'nao avancou' };
return FAM._incluir(nome, cods.map(String), qNome || nome);
},
async add(codFam, cods, qNome) {
location.hash = '#/familiaProdutos'; await FAM.espera(3000); location.hash = '#/familiaProdutos/cadastro/' + codFam; await FAM.espera(6000);
FAM.botao('Próximo').click(); await FAM.espera(2500); const nome = (document.body.innerText.match(/Produtos \/ ([^\n]+)/) || [])[1];
return FAM._incluir(nome, cods.map(String), qNome || nome);
},
async _incluir(nome, cods, qNome) {
const log = [];
for (const c of cods) {
if (new RegExp('\\b' + c + '\\b').test(FAM.lista(nome))) { log.push(c + ':já'); continue; }
await FAM.abrirPainelEFocar(); FAM.digitar(FAM.inputBusca(), c); await FAM.espera(3000); let m = await FAM.marcarCodigo(c);
if (!m && qNome) { FAM.digitar(FAM.inputBusca(), qNome); await FAM.espera(3000); m = await FAM.marcarCodigo(c); if (m) log.push(c + ':pelo nome'); }
log.push(c + ':' + m); if (m) await FAM.salvarPainel(); else { const x = FAM.botao('Cancelar', true); if (x) x.click(); await FAM.espera(1500); }
}
const lista = FAM.lista(nome); const faltam = cods.filter((c) => !new RegExp('\\b' + c + '\\b').test(lista)); let url = null; if (!faltam.length) url = await FAM.salvarFamilia();
return { nome, log, faltam, url };
},
async lote(l) { const o = []; for (const [n, c, q] of l) { const r = await FAM.nova(n, c, q); o.push(n + ': faltam ' + JSON.stringify(r.faltam || r.erro) + ' url ' + r.url); } return o; },
};
})();
window.REAJ = {
f: () => document.querySelector('iframe[src*="reajusteDePreco"]'),
esp: (ms) => new Promise((r) => setTimeout(r, ms)),
async _set(id, v) { const f = REAJ.f(), d = f.contentDocument, $ = f.contentWindow.jQuery; const el = d.getElementById(id); el.focus(); el.value = v; $(el).trigger('keydown').trigger('keyup').trigger('change').trigger('blur'); await REAJ.esp(2300); },
async precoFamilia(cod, preco) {
const f = REAJ.f(), d = f.contentDocument, w = f.contentWindow, $ = w.jQuery; const esp = REAJ.esp;
await REAJ._set('codigoDaLoja', '1'); await REAJ._set('codigoDoProduto', String(cod));
if (!d.getElementById('descricaoDoProduto').value) { await esp(2500); await REAJ._set('codigoDaLoja', '1'); await REAJ._set('codigoDoProduto', String(cod)); }
const antes = { prod: d.getElementById('descricaoDoProduto').value, venda: d.getElementById('venda1').value, custo: d.getElementById('custoProduto').value };
const v = d.getElementById('venda1'); v.focus(); v.value = preco; $(v).trigger('keydown').trigger('keypress').trigger('input').trigger('keyup').trigger('change').trigger('blur'); await esp(1000);
const depois = d.getElementById('venda1').value; if (depois !== preco) return { antes, depois, erro: 'valor nao aceito' };
const clique = (el) => { const rc = el.getBoundingClientRect(); ['mousedown', 'mouseup', 'click'].forEach((t) => el.dispatchEvent(new w.MouseEvent(t, { bubbles: true, cancelable: true, view: w, clientX: rc.left + 5, clientY: rc.top + 5 }))); };
const vis = () => Array.from(d.querySelectorAll('.modal, .bootbox, [role=dialog]')).filter((e) => e.offsetParent !== null);
const btn = (txt) => { for (const m of vis().reverse()) { const b = Array.from(m.querySelectorAll('button,input[type=button]')).find((x) => (x.innerText || x.value || '').trim() === txt && x.offsetParent !== null); if (b) return b; } return null; };
const log = []; clique(d.getElementById('btn_salvar')); await esp(3000);
for (let k = 0; k < 6; k++) {
const txt = vis().map((e) => e.innerText.replace(/\s+/g, ' ').slice(0, 90)).join(' | '); log.push(txt);
if (/sucesso/i.test(txt)) { const b = btn('Ok'); if (b) clique(b); await esp(1000); break; }
if (/Fam[ií]lia|outras lojas|menor que o Custo/i.test(txt)) { const b = btn('Sim'); if (b) { clique(b); await esp(3000); continue; } }
const c = vis().map((m) => m.querySelector('#btn_confirmar')).find((x) => x); if (c) { clique(c); await esp(3000); continue; }
break;
}
return { cod, antes: antes.venda, depois, custo: antes.custo, familia: log.some((x) => /Fam[ií]lia/i.test(x)), sucesso: log.some((x) => /sucesso/i.test(x)) };
},
async aplicarLote(lista) { const out = []; for (const [c, p] of lista) { try { const r = await REAJ.precoFamilia(c, p); out.push(c + ' ' + r.antes + '→' + r.depois + ' fam:' + r.familia + ' ok:' + r.sucesso + (r.erro ? ' ' + r.erro : '')); } catch (e) { out.push(c + ' erro ' + e); } await REAJ.esp(3000); } return out; },
async ir() { location.hash = '#/vf?r=%2FreajusteDePreco%2Fedita%3Ft%3D' + Date.now(); await REAJ.esp(8000); },
async lerVenda(cods) { const d = REAJ.f().contentDocument; const o = {}; await REAJ._set('codigoDaLoja', '1'); for (const c of cods) { await REAJ._set('codigoDoProduto', String(c)); o[c] = d.getElementById('venda1').value; } return o; },
};
window.bg = (fn) => { window._bg = { done: false }; Promise.resolve().then(fn).then((r) => { window._bg = { done: true, r }; }, (e) => { window._bg = { done: true, r: 'ERRO ' + e }; }); return 'iniciado'; };
window.esperarBg = async (s) => { for (let i = 0; i < (s || 25) && !(window._bg && window._bg.done); i++) await new Promise((r) => setTimeout(r, 1000)); return window._bg && window._bg.done ? window._bg.r : 'rodando'; };
window.MOV = (function(){
const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const ctx = () => { const f = PROD.f(); return { f, d: f.contentDocument, w: f.contentWindow, $: f.contentWindow.jQuery }; };
const dlg = (d) => Array.from(d.querySelectorAll('.modal, .bootbox, [role=dialog]')).filter(e => e.offsetParent !== null);
const botao = (d, t) => Array.from(d.querySelectorAll('.modal button, .bootbox button')).find(b => b.offsetParent !== null && b.innerText.trim() === t);
const aba = (d, t) => Array.from(d.querySelectorAll('a')).find(a => a.offsetParent !== null && a.innerText.trim() === t).click();
async function abrir(cod) {
location.hash = '#/vf?r=%2Fproduto%2Fcadastro%3Ft%3D' + Date.now(); await esp(8000);
let { d, w, $ } = ctx();
d.getElementById('codigo').value = String(cod); $('#codigo').trigger('change'); d.getElementById('botaoPesquisar').click();
let row; for (let i = 0; i < 15 && !row; i++) { await esp(1000); row = Array.from(d.querySelectorAll('table tbody tr[role=row]')).find(r => { const t = Array.from(r.querySelectorAll('td')).find(x => x.innerText.trim()); return t && t.innerText.trim() === String(cod); }); }
if (!row) throw 'não achei ' + cod;
PROD.clique(w, Array.from(row.querySelectorAll('td')).find(t => t.innerText.trim()), true);
for (let i = 0; i < 20; i++) { await esp(1000); ({ d } = ctx()); if (d.getElementById('gridProdutoAux') && d.getElementById('codigo').value === String(cod) && d.getElementById('descricao').value) break; }
await esp(1500); ({ d } = ctx());
if (d.getElementById('codigo').value !== String(cod)) throw 'abriu errado ' + d.getElementById('codigo').value;
}
function ler() {
const { d } = ctx();
const aux = Array.from(d.querySelectorAll('#gridProdutoAux tr.jqgrow')).map(r => { const o = {}; r.querySelectorAll('input').forEach(i => o[i.name.split('.').pop()] = i.value); return o; });
const forn = Array.from(d.querySelectorAll('#gridFornecedor tr.jqgrow')).map(r => { const o = {}; r.querySelectorAll('input').forEach(i => o[i.name.replace('referenciaDoFornecedor[].', '')] = i.value); return o; });
return { cod: d.getElementById('codigo').value, desc: d.getElementById('descricao').value, aux, forn };
}
async function excluirTudo(gridId, btnId, abaNome) {
const { d, w, $ } = ctx(); aba(d, abaNome); await esp(1000);
for (let i = 0; i < 20; i++) {
const r = d.querySelector('#' + gridId + ' tr.jqgrow'); if (!r) break;
PROD.clique(w, Array.from(r.querySelectorAll('td')).find(t => t.offsetParent !== null)); await esp(500);
$('#' + btnId).click(); await esp(1200); const s = botao(d, 'Sim'); if (!s) throw 'sem confirmação ' + gridId; PROD.clique(w, s); await esp(1200);
}
}
async function addForn(o, nivel) {
const { d, w, $ } = ctx(); aba(d, 'Fornecedor'); await esp(1000);
$('#adicionarFornecedor').click(); await esp(1500);
const c = d.getElementById('codigoFornecedor'); c.focus(); c.value = o['fornecedor.codigo']; $(c).trigger('change').trigger('blur'); await esp(2500);
const s = $('#unidadeDoFornecedor'); if (d.getElementById('unidadeDoFornecedor').options.length <= 1) { s.select2('open'); await esp(2000); s.select2('close'); }
s.val(o.unidade).trigger('change'); await esp(400);
const q = d.getElementById('qtdItensFornecedor'); q.focus(); q.value = o.quantidade.replace(/,000$/, ''); $(q).trigger('keyup').trigger('change').trigger('blur');
const r = d.getElementById('referenciaFornecedor'); r.focus(); r.value = o.referencia; $(r).trigger('keyup').trigger('change').trigger('blur');
$('#niveisFornecedor').val(nivel).trigger('change'); await esp(400);
PROD.clique(w, d.getElementById('adicionaItemDeFornecedorNaGrid')); await esp(2000);
const m = dlg(d).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 150)); if (m.length) { const ok = botao(d, 'Ok'); if (ok) PROD.clique(w, ok); await esp(600); }
return m;
}
async function addEan(cod, fator) {
const { d, w, $ } = ctx(); aba(d, 'Principal'); await esp(1000);
$('#adicionarAuxiliar').click(); await esp(1500);
$('#tipoDeProdutoAuxiliar').val('EAN').trigger('change'); await esp(300);
const e = d.getElementById('entradaDoCodAux'); e.focus(); e.value = cod; $(e).trigger('keyup').trigger('change');
const fa = d.getElementById('fatorDoCodAux'); fa.value = String(parseFloat(fator) || 1); $(fa).trigger('change');
const t = d.getElementById('eanTributado'); if (t.checked) t.click();
await esp(300); PROD.clique(w, d.getElementById('botaoConfirmaCodigoAux')); await esp(1500);
const m = dlg(d).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 150)); if (m.length) { const ok = botao(d, 'Ok'); if (ok) PROD.clique(w, ok); await esp(600); }
return m;
}
async function mover(a, b) {
const log = { a, b };
await abrir(a); const A = ler(); log.A = A;
await excluirTudo('gridProdutoAux', 'excluirAuxiliar', 'Principal');
await excluirTudo('gridFornecedor', 'excluirFornecedor', 'Fornecedor');
log.gravouA = (await PROD.gravarCompleto()).join(' | ');
localStorage['MOV_' + a] = JSON.stringify(A);
if (!/sucesso/i.test(log.gravouA)) return log;
return completarB(b, A, log);
}
async function completarB(b, A, log) {
log = log || { b };
await abrir(b); const B = ler(); log.Bantes = B;
log.forn = [];
for (const o of A.forn) {
if (B.forn.some(x => x['fornecedor.codigo'] === o['fornecedor.codigo'] && x.referencia === o.referencia)) { log.forn.push('já tinha ' + o['fornecedor.codigo'] + '/' + o.referencia); continue; }
log.forn.push(o['fornecedor.codigo'] + '/' + o.referencia + ' ' + JSON.stringify(await addForn(o, B.forn.length ? 'SECUNDARIO' : o.nivel)));
}
log.ean = [];
for (const x of A.aux) log.ean.push(x.codigo + ' ' + JSON.stringify(await addEan(x.codigo, x.fator)));
log.gravouB = (await PROD.gravarCompleto()).join(' | ');
log.Bdepois = ler();
return log;
}
return { abrir, ler, mover, completarB };
})();
'ferramentas ok: ' + ['NF','CAD','PROD','FAM','REAJ','MOV'].filter(k=>window[k]).join(',')`; try { localStorage.TUDO_toolkit = src; } catch (e) {} try { const r = indexedDB.open('vfkit', 1); r.onupgradeneeded = () => r.result.createObjectStore('k'); r.onsuccess = () => r.result.transaction('k', 'readwrite').objectStore('k').put(src, 'tudo'); } catch (e) {} return eval(src); })()
