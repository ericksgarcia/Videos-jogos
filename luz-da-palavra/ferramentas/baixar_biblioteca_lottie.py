"""Baixa a biblioteca Lottie do canal (ids em catalogo-lottie.md) para luz-da-palavra/identidade/lottie/ (não versionada: a licença Lottie Simple
não permite redistribuir os arquivos; guardamos só os ids). Uso: python luz-da-palavra/ferramentas/baixar_biblioteca_lottie.py"""
import subprocess, shutil, json, sys
from pathlib import Path
P={"fogo":54405,"fogueira_simples":36316,"fogueira_noite":139587,"fogueira_chama":114252,"chama_brasas":1525430,"vela_real":100552,"vela_brilho":28802,"luz_estrela":135839,"raios_luz":83683,"brilho_dourado":38319,"estrelas_ouro":1036798,"estrelas_ouro2":89463,"lua_estrelas":74927,"lua_azul":148443,"lua_nuvem":101279,"ceu_noite":1507775,"sol":114460,"nascer_sol":17806,"chuva":16477,"chuva2":91475,"broto":41474,"broto_terra":30875,"arvore":72702,"oliva":117908,"barco":28125,"barco_pesca":144160,"veleiro":7961,"peixe":91084,"livro_aberto":1038881,"biblia":108176,"livro_raios":87784,"caneta":1028069,"carta_antiga":1512508,"ampulheta":119400,"ampulheta2":28757,"porta":94725,"chave":39031,"pegadas":1025715,"gota":135666,"coracao_particulas":1504849,"coracoes":26329,"pomba_cinza":108190,"pomba_ramo":1050007,"pomba_origami":1520284,"igreja_linha":113012,"deserto_noite":148102,"deserto_noite_v":42995,"montanhas":1030843,"escudo":112796,"folhas_vento":93405,"folhas":1027728,"borboleta":140315,"maos_orando":1026664,"maos_abertas":1028730,"estrela_simples":1902,"relogio":18528}
falhas=[]
for nome,i in P.items():
    r=subprocess.run(["python","aprendendo/motor/lottie.py","baixar",str(i),"_biblioteca",nome],capture_output=True,text=True)
    print(nome,i,(r.stdout+r.stderr).strip().splitlines()[-1][:110] if (r.stdout+r.stderr).strip() else "?")
src=Path("aprendendo/videos/_biblioteca/lottie"); dst=Path("luz-da-palavra/identidade/lottie")
for f in src.glob("*.json"): shutil.copy(f,dst/f.name)
shutil.rmtree("aprendendo/videos/_biblioteca"); shutil.rmtree("aprendendo/videos/teste-lottie",ignore_errors=True)
