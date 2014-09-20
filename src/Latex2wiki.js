/** Latex2wiki **
 */

//import sys, re

var bullet_level = 0;
var bdoc = None;
var end_line = 1;

var verbatim_mode = 0;

function dummy(){
	/* pass; */
}

function inc_bullet(){
	/* global bullet_level; */
	bullet_level += 1;
}

function dec_bullet(){
	/* global bullet_level; */
	bullet_level -= 1;
}

function start_doc(){
	/* global bdoc; */
	bdoc = 1;
}

function do_not_el(){
	/* global end_line; */
	end_line = None;
}

function do_el(){
	/* global end_line; */
	end_line = 1;
}

function decide_el(){
	/* global end_line; */
	return (bullet_level === 0) ? '\n' : ' ';
}

function start_verbatim(){
	/* global verbatim_mode; */
	verbatim_mode = 1;
}

function end_verbatim(){
	/* global verbatim_mode; */
	verbatim_mode = 0;
}

var conv_table = { '>':'&gt;',
			   '<':'&lt;'};

function translate_to_html(char){
	/* global verbatim_mode;
	global conv_table; */
	return ( verbatim_mode === 0 )? conv_table[char] : char;
}

function header(i){
	/* return ur"%s \1 %s" % % (i*'=', i*'='); */
}

var NONE = "__@NONE@__";

tr_list2 = [
	//[/>/, (lambda: translate_to_html('>')), dummy],
	//]/</, (lambda: translate_to_html('<')), dummy],
	[/\$\$?([^$]*?)\$?\$/im, (lambda: "<math>\1</math>"), dummy],
	[/\\footnotesize/, None, dummy],
	[/\\footnote{(.*?)}/, (lambda :"<ref>\1</ref>"), dummy],
	[/\\index\{(.*?)\}/, None, dummy], //todo
	[/\\ldots/, (lambda : "..."), dummy],
	[/\\Pagebreak/i, (lambda : ""), dummy], //pagebreak
	[/\-{3}/, (lambda : "â€”"), dummy],
	[/{\\em (.*?)}/, (lambda : "''\1''"), dummy], //cursivas
	[/^\\pro /im, (lambda : "#"), dummy], //lista ordenada
	[/^\\spro /im, (lambda : "*"), dummy], //lista sin orden
	[/\\ldots/, (lambda : "..."), dummy],
	[/\\begin\{document}/, None, start_doc],
	[/\\\\$/, (lambda : "\n\n"), dummy],
	[/\\\$/, (lambda : "$"), dummy],
	[/\\emph{(.*?)}/, (lambda : "_\1_"), dummy],
	[/\\textit{(.*?)}/i, (lambda : "''\1''"), dummy],
	[/\\texttt{(.*?)}/i, (lambda : "<tt>\1</tt>"), dummy],
	[/\\textbf{(.*?)}/i, (lambda : "'''\1'''"), dummy],
	[/\\url{(.*?)}/i, (lambda : "\1"), dummy],
	[/\\begin{verbatim}/, (lambda : "<verbatim>"), start_verbatim],
	[/\\end{verbatim}/, (lambda : "</verbatim>"), end_verbatim],
	[/\\begin{itemize}/, (lambda : "\n"), inc_bullet],
	[/\\end{itemize}/, None, dec_bullet],
	[/\\item (.*?)/, (lambda : ur"\n" + (ur"   " * bullet_level) + ur"* \1"), dummy),
	[/\\item\[(.*?)\][\n ]*/, (lambda : ":\1 "), dummy],
	[/\\begin{.*?}/, None, dummy],
	[/\\end{.*?}/, None, dummy],
	[/``(.*?)''/, (lambda :ur'"\1"'), dummy],
	[/\\subsubsection{(.*?)}/i, (lambda : header(4)), dummy],
	[/\\subsection{(.*?)}/i, (lambda : header(3)), dummy],
	[/\\section{(.*?)}/i, (lambda : header(2)), dummy],
	[/\\chaptere?{(.*?)}/i, (lambda : header(1)), dummy],
	[/\\index{(.*?)}/i, None, dummy],
	[/\\_/, (lambda :"_"), dummy],
	[/\\tableofcontents/,None, dummy],
	[/\\null/,None, dummy],
	[/\\newpage/,None, dummy],
	[/\\thispagestyle{.*?}/, None, dummy],
	[/\\maketitle/, None, dummy],
	[/\\-/, None, dummy],
	[/\\clearpage/, (lambda : ur'<br clear="all" />'), dummy],
	[/\\cleardoublepage/, (lambda : ur'<br clear="all" />'), dummy],
	[/\\markboth{}{}/, None, dummy], //todo
	[/\\addcontentsline.*/, None, dummy], //todo
	//[/\n$/, decide_el, dummy],
	//[/(\w)[\n\r]+(\w)/im, (lambda :ur'\1 \2'), dummy],
	//[/[^\\]?\{/, None, dummy],
	//[/[^\\]?\}/, None, dummy],
	[/^\%.*$\n/im, None, dummy], //quitamos comentarios
	[/\\\\/, (lambda: ur'\n'), dummy],
	[/\\tt ([^\}]*)/, (lambda: ur'<tt>\1</tt>'), dummy],
	[/\\small ([^\}]*)/, (lambda: ur'<small>\1</small>'), dummy],
	[/\\centerline{(.*?)}/, (lambda: ur'<center>\1</center>'), dummy],
	[/\\copyright/, (lambda: ur'Â©'), dummy],
    ]

//in_stream  = sys.stdin;
var path='';
if (len(sys.argv)==2){
	arg1=sys.argv[1];
	f=open(arg1, 'r');
	s=arg1.split('\\');
	path='\\'.join(s[:len(s)-1])+'\\';
}else{
	print; 'Introduce un parametro con el nombre del fichero que contienen el codigo fuente en latex';
	sys.exit();
}
var out_stream = sys.stdout;

//for i in in_stream.readlines(){
var salida='';
salida=unicode(f.read(), 'utf-8');


//INICIO PRE-PROCESADO

//metemos los inputs
var m=re.compile(ur'\\input\{(?P<filename>[^\}]*?)\}').finditer(salida);
for (i in m){
	filename=path+i.group('filename')+'.tex';
	try{
		g=open(filename, 'r');
		salida=re.sub(ur'\\input\{%s\}' % i.group('filename'), unicode(g.read(), 'utf-8'), salida);
		g.close();
	}except{
		print 'Fichero %s no encontrado' % filename;
	}
}

//salida=re.sub(ur'([^\n])\n([^\n])', ur'\1 \2', salida); //metemos espacios al concatenar lineas consecutivas
salida=re.sub(ur'\n\n\n+', ur'\n\n', salida); //quitamos saltos excesivos
salida=re.sub(ur'(?m)^\s*', ur'', salida); //quitamos espacios inicio lÃ­nea

//FIN PRE-PROCESADO


//INICIO PROCESADO
for (reg, sub, fun in tr_list2){
	p = re.compile(reg)
	if p.search(salida){
		fun()
	}
  if (sub != None){
		salida = p.sub(sub(), salida);
	}else{
		salida = p.sub(//, salida);
  }
}
//FIN PROCESADO


//post-procesado
salida=re.sub(ur'\n\n\n+', ur'\n\n', salida); //quitamos saltos excesivos
salida=re.sub(ur'\n\n+([\*\#])', ur'\n\1', salida); //quitamos saltos en listas

f.close();
f=open('salida.wiki', 'w');
if re.search(ur'<ref[> ]', salida){
	salida+='\n\n== Referencias ==\n<references />';
}
f.write(salida.encode('utf-8'));
f.close();