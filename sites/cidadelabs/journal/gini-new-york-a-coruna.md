---
title: "A desigualdade de Nova York, pintada coas cores da Coruña"
indexSummary: "A Coruña e Nova York, coa mesma escala de Gini."
description: "Como cambia a comparación cando se axustan os datos de renda de Nova York á medida española."
pubDate: 2026-07-27
recordId: "gini"
author: "Cidade Labs"
lang: "gl"
draft: false
kind: "research"
scope: "A Coruña / New York"
source: "INE · US Census Bureau"
repository: "https://github.com/cidade-labs/journal_gini-nyc"
---

Isto empezou como unha curiosidade. Sen tese, sen recomendación política. Só unha pregunta que levaba tempo dándome voltas desde que fixen o [ADRH Mapper](https://adrh.cidadelabs.org): **que aspecto tería o mapa de desigualdade da Coruña se o soltases enriba de Nova York?**

A pregunta pódese facer por isto. O INE publica un índice de Gini para cada sección censal do país, unhas 36.000, unha vez ao ano, elaborado a partir dos datos fiscais. A Oficina do Censo dos Estados Unidos publica outro para cada sección censal súa, pero constrúeo a partir dunha enquisa voluntaria. As dúas administracións danche, pois, un número.

Só que non é o mesmo número.

## Que é un índice de Gini

É un só número para saber o repartida que está a renda nun lugar. Pon a todo o mundo en fila, do máis pobre ao máis rico, e mira canta da renda total ten realmente cada tramo de poboación. Nunha cidade onde todo o mundo gañase o mesmo, o 30 % máis pobre tería o 30 % da renda e sairíache unha liña recta. Ningunha cidade real o fai.

O Gini é o que a curva real baixa por debaixo desa liña recta. Cero significa que todo o mundo gaña o mesmo, e cen significa que un único fogar o ten todo. A Coruña puntúa 32 e Nova York puntúa 45.

<figure class="figure">
  <img src="/journal/gini/18_how_gini_works.png" alt="Curvas de Lorenz da Coruña e de Nova York fronte a unha diagonal descontinua que representa a igualdade perfecta. A curva de Nova York baixa máis ca a da Coruña." loading="lazy" />
  <figcaption>As dúas cidades fronte á mesma liña descontinua. A curva de Nova York afúndese máis, que é o que significa un Gini máis alto. Isto mide o estirada que está a renda, non o alta que é, cousa que importa máis adiante.</figcaption>
</figure>

## Facer que os dous números signifiquen o mesmo

España mide a renda **despois de impostos**, **axustada ao tamaño do fogar** (unha parella non é dúas veces máis rica ca unha persoa soa: o alugueiro non se duplica), contada **por persoa**, e recorta os extremos para que un único xestor de fondos non defina un barrio enteiro. A cifra estadounidense non é ningunha desas cousas: conta a renda do fogar, antes de impostos, sen axustar e sen recortar.

As catro diferenzas empurran o número de Nova York cara arriba. Así que pechar a fenda significou reconstruír a definición española para Nova York desde cero, o que á súa vez significou escribir un modelo funcional dos códigos fiscais federal, estatal e municipal, e pasar por el todos os fogares de Nova York.

Isto move Nova York de **54,7 a 45,0**.

<figure class="figure">
  <img src="/journal/gini/16_what_changed.png" alt="Gráfico de barras dos catro axustes que separan o Gini español do estadounidense, ordenados por tamaño: impostos e prestacións restan 5,8 puntos; contar persoas e non fogares, 1,6; ignorar o 3 % máis extremo, 1,3; e axustar polo tamaño do fogar, 0,9." loading="lazy" />
  <figcaption>Aplicados aos mesmos datos de Nova York, os catro axustes moven o Gini da cidade de 54,7 a 45,0. Un deles fai case todo o traballo: 5,8 dos 9,7 puntos son só impostos.</figcaption>
</figure>

O imposto é o grande, e o máis doado de describir. Para cada fogar da cidade, pásase a súa renda polo código fiscal e mírase o que queda de verdade:

<div class="formula">
  <p class="eq">renda neta = renda monetaria − imposto sobre a renda − cotizacións sociais + deducións reembolsables</p>
  <p class="note">O imposto sobre a renda é a suma do federal, o do estado de Nova York e o da cidade. As cotizacións son a parte que paga a persoa traballadora para a Seguridade Social e Medicare. As deducións reembolsables son os créditos por rendas do traballo e por fillos, que nos fogares de renda baixa pagan máis do que o fogar debe.</p>
</div>

<figure class="figure">
  <img src="/journal/gini/17_tax_model.png" alt="Gráfico de barras do tipo efectivo por decil de renda do fogar en Nova York, que vai do menos 7 % no décimo máis pobre ao máis 37 % no máis rico." loading="lazy" />
  <figcaption>O décimo máis pobre dos fogares neoiorquinos recibe máis do que paga. O décimo máis rico paga o 37 % da súa renda. A cifra española xa leva isto feito, e a estadounidense non.</figcaption>
</figure>

## O dato curioso

Nalgún punto do modelo fiscal fun buscar as ganancias patrimoniais nos datos estadounidenses e non as atopei.

Non están. A American Community Survey, a enquisa detrás de practicamente toda estatística de renda a nivel de barrio nos Estados Unidos, pregunta por salarios, traballo por conta propia, xuros, dividendos, alugueiros, pensións e prestacións. Non pregunta polas ganancias patrimoniais. Están excluídas por definición do que a Oficina do Censo chama "money income".

O que significa que a maior fonte de ingresos no extremo superior da distribución estadounidense falta na estatística que os Estados Unidos usan para medir a súa propia desigualdade. ([CBO, 2022](https://www.cbo.gov/publication/62300))

A axencia tributaria estadounidense, o Internal Revenue Service (IRS), sabe exactamente que ganancias patrimoniais se realizaron e quen as tivo. Ese ficheiro simplemente nunca se atopa coa enquisa da Oficina do Censo dos Estados Unidos. España consegue todo nun só número anual porque a Axencia Tributaria lle entrega os datos ao instituto de estatística.

Consecuencia práctica: toda cifra dos Estados Unidos que aparece a continuación é un **chan**. Tal e como funciona a riqueza nos Estados Unidos, o número real debería ser máis alto.

## O experimento

Os mapas orixinais usan rangos de cor distintos, así que a mesma cor non representa o mesmo valor de Gini nas dúas cidades.

Os mapas de abaixo aplican os cortes de cor de cada cidade aos datos da outra.

<figure class="figure gini-fig">
  <input type="radio" name="scale-nyc" id="scale-nyc-a" class="sa" checked />
  <input type="radio" name="scale-nyc" id="scale-nyc-b" class="sb" />
  <p class="figure-title">Nova York, lida dúas veces</p>
  <p class="figure-sub">As mesmas 2.208 seccións censais, sobre o concepto de renda español. Só cambian os cortes de clase.</p>
  <div class="gini-tabs">
    <label for="scale-nyc-a" data-for="a">Na escala da Coruña</label>
    <label for="scale-nyc-b" data-for="b">Na súa propia escala</label>
  </div>
  <div class="gini-body">
    <div class="gini-pane pane-a">
      <img src="/journal/gini/map-nyc-a.svg" alt="Mapa das seccións censais de Nova York clasificadas cos cortes de Gini da Coruña. Case toda a cidade queda na clase máis escura." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 27,1</li>
        <li><i class="k2"></i>27,1–29,3</li>
        <li><i class="k3"></i>29,3–31,0</li>
        <li><i class="k4"></i>31,0–32,5</li>
        <li><i class="k5"></i>32,5 ou máis</li>
        <li><i class="k0"></i>sen datos</li>
      </ul>
    </div>
    <div class="gini-pane pane-b">
      <img src="/journal/gini/map-nyc-b.svg" alt="O mesmo mapa de Nova York clasificado cos seus propios quintís de Gini, mostrando unha variación detallada por toda a cidade." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 31,4</li>
        <li><i class="k2"></i>31,4–34,7</li>
        <li><i class="k3"></i>34,7–37,7</li>
        <li><i class="k4"></i>37,7–41,4</li>
        <li><i class="k5"></i>41,4 ou máis</li>
        <li><i class="k0"></i>sen datos</li>
      </ul>
    </div>
  </div>
  <figcaption>Índice de Gini por sección censal, US Census Bureau, ACS 2019–2023, harmonizado á definición española. En gris: parques, aeroportos e cemiterios, ou unidades pequenas de máis para publicar.</figcaption>
</figure>

Na escala da Coruña, a cidade é practicamente dunha soa cor. **Tres cuartas partes das seccións censais de Nova York caen na clase máis alta**, a franxa que A Coruña reserva para o seu quinto máis desigual. Cambia á súa propia escala e todo o detalle volve. As mesmas seccións e os mesmos números, nos dous casos.

Faino ao revés e A Coruña vólvese case toda azul.

<figure class="figure gini-fig">
  <input type="radio" name="scale-cor" id="scale-cor-a" class="sa" checked />
  <input type="radio" name="scale-cor" id="scale-cor-b" class="sb" />
  <p class="figure-title">A Coruña, lida dúas veces</p>
  <p class="figure-sub">As mesmas 186 seccións censais e os mesmos valores. Só cambian os cortes de clase.</p>
  <div class="gini-tabs">
    <label for="scale-cor-a" data-for="a">Na súa propia escala</label>
    <label for="scale-cor-b" data-for="b">Na escala de Nova York</label>
  </div>
  <div class="gini-body">
    <div class="gini-pane pane-a">
      <img src="/journal/gini/map-coruna-a.svg" alt="Mapa das seccións censais da Coruña clasificadas cos seus propios quintís de Gini, cunha gama completa de cores pola cidade." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 27,1</li>
        <li><i class="k2"></i>27,1–29,3</li>
        <li><i class="k3"></i>29,3–31,0</li>
        <li><i class="k4"></i>31,0–32,5</li>
        <li><i class="k5"></i>32,5 ou máis</li>
      </ul>
    </div>
    <div class="gini-pane pane-b">
      <img src="/journal/gini/map-coruna-b.svg" alt="O mesmo mapa da Coruña clasificado cos cortes de Gini de Nova York. Dous terzos da cidade caen na clase máis igualitaria." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 31,4</li>
        <li><i class="k2"></i>31,4–34,7</li>
        <li><i class="k3"></i>34,7–37,7</li>
        <li><i class="k4"></i>37,7–41,4</li>
        <li><i class="k5"></i>41,4 ou máis</li>
      </ul>
    </div>
  </div>
  <figcaption>Índice de Gini por sección censal, INE, Atlas de Distribución de Renta de los Hogares, 2023. Na escala de Nova York, dous terzos da Coruña colapsan nunha única clase, a máis igualitaria.</figcaption>
</figure>

## Achados

A desigualdade acumúlase no centro denso, vello e mesturado. Nos dous mapas o vermello asenta no núcleo de poboamento antigo e vaise diluíndo cara aos bordos: o mesmo patrón en Galicia que en Nova York, ao mesmo grao.

Nova York podería reflectir unha tendencia máis ampla de desigualdade máis extrema nos Estados Unidos. Esa tendencia resulta máis difícil de ver porque o que adoita ser unha fonte de riqueza para quen máis gaña, as ganancias patrimoniais, non aparecen nos datos da enquisa estadounidense.

Os valores altos de Gini cobren moita máis parte das seccións censais de Nova York que das da Coruña.

<figure class="figure">
  <img src="/journal/gini/15_neighbourhood_comparison.png" alt="Gráfico de puntos que sitúa os dez distritos censais da Coruña ao longo da distribución de 196 áreas de barrio de Nova York segundo o seu Gini mediano." loading="lazy" />
  <figcaption>Os dez distritos da Coruña soltados na distribución das 196 áreas de barrio de Nova York, próximas aos distritos coruñeses en poboación. Só o 9 % dos barrios neoiorquinos son máis igualitarios que o distrito mediano da Coruña; pero un 34 % sono máis que o distrito coruñés máis desigual. As dúas cidades solápanse; non se superpoñen.</figcaption>
</figure>

## O que isto non resolve

**A escala.** A Coruña ten 245.000 habitantes; Nova York, 8,8 millóns. A escala move os mercados da vivenda, a segregación e a distancia social de maneiras que ningún coeficiente toca. A miña intuición é que Madrid e Barcelona se parecerían máis a Nova York ca á Coruña neste terreo, pero é unha intuición, e non está nestes datos.

**Ganancias patrimoniais.** Mentres as ganancias patrimoniais estadounidenses non cheguen ás estatísticas de barrio, toda cifra dos Estados Unidos aquí é un mínimo.

**Dispersión e contexto.** O Gini describe o estirada que está a renda dentro dunha área, e depende por completo do contexto. Dous barrios, en cidades distintas, poden puntuar igual e non parecerse en nada.

**Benestar.** Este marco é a miña lectura persoal, non algo que midan os números de enriba. Os impostos da Coruña financian escolas infantís, universidade, sanidade, transporte e unha pensión coa que se pode vivir, e os de Nova York maiormente non compran as mesmas cousas. Se iso é certo, rendas que parecen iguais nas dúas cidades non son vidas iguais, e ningunha harmonización arranxa iso.

---

*Datos españois: INE, Atlas de Distribución de Renta de los Hogares, 2023. Datos estadounidenses: US Census Bureau, ACS 2019–2023 e microdatos PUMS. O método, as fontes e a lista completa de limitacións están documentados xunto co código.*
