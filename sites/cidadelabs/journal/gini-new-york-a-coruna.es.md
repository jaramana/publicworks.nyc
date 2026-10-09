---
title: "La desigualdad de Nueva York, pintada con los colores de A Coruña"
indexSummary: "A Coruña y Nueva York, con la misma escala de Gini."
description: "Cómo cambia la comparación cuando se ajustan los datos de renta de Nueva York a la medida española."
pubDate: 2026-07-27
recordId: "gini"
author: "Cidade Labs"
lang: "es"
draft: false
kind: "research"
scope: "A Coruña / New York"
source: "INE · US Census Bureau"
repository: "https://github.com/cidade-labs/journal_gini-nyc"
---

Esto empezó como una curiosidad. Sin tesis, sin recomendación política. Solo una pregunta que llevaba tiempo rondándome desde que hice el [ADRH Mapper](https://adrh.cidadelabs.org): **¿qué aspecto tendría el mapa de desigualdad de A Coruña si lo soltaras encima de Nueva York?**

La pregunta se puede hacer por esto. El INE publica un índice de Gini para cada sección censal del país, unas 36.000, una vez al año, elaborado a partir de los datos fiscales. La Oficina del Censo de Estados Unidos publica otro para cada sección censal suya, pero lo construye a partir de una encuesta voluntaria. Las dos administraciones te dan, pues, un número.

Solo que no es el mismo número.

## Qué es un índice de Gini

Es un solo número para saber lo repartida que está la renta en un lugar. Pon a todo el mundo en fila, del más pobre al más rico, y mira cuánta de la renta total tiene realmente cada tramo de población. En una ciudad donde todo el mundo ganara lo mismo, el 30 % más pobre tendría el 30 % de la renta y te saldría una línea recta. Ninguna ciudad real lo hace.

El Gini es lo que la curva real baja por debajo de esa línea recta. Cero significa que todo el mundo gana lo mismo, y cien significa que un único hogar lo tiene todo. A Coruña puntúa 32 y Nueva York puntúa 45.

<figure class="figure">
  <img src="/journal/gini/18_how_gini_works.png" alt="Curvas de Lorenz de A Coruña y de Nueva York frente a una diagonal discontinua que representa la igualdad perfecta. La curva de Nueva York baja más que la de A Coruña." loading="lazy" />
  <figcaption>Las dos ciudades frente a la misma línea discontinua. La curva de Nueva York se hunde más, que es lo que significa un Gini más alto. Esto mide lo estirada que está la renta, no lo alta que es, algo que importa más adelante.</figcaption>
</figure>

## Hacer que los dos números signifiquen lo mismo

España mide la renta **después de impuestos**, **ajustada al tamaño del hogar** (una pareja no es dos veces más rica que una persona sola: el alquiler no se duplica), contada **por persona**, y recorta los extremos para que un único gestor de fondos no defina un barrio entero. La cifra estadounidense no es ninguna de esas cosas: cuenta la renta del hogar, antes de impuestos, sin ajustar y sin recortar.

Las cuatro diferencias empujan el número de Nueva York hacia arriba. Así que cerrar la brecha significó reconstruir la definición española para Nueva York desde cero, lo que a su vez significó escribir un modelo funcional de los códigos fiscales federal, estatal y municipal, y pasar por él todos los hogares de Nueva York.

Esto mueve Nueva York de **54,7 a 45,0**.

<figure class="figure">
  <img src="/journal/gini/16_what_changed.png" alt="Gráfico de barras de los cuatro ajustes que separan el Gini español del estadounidense, ordenados por tamaño: impuestos y prestaciones restan 5,8 puntos; contar personas y no hogares, 1,6; ignorar el 3 % más extremo, 1,3; y ajustar por el tamaño del hogar, 0,9." loading="lazy" />
  <figcaption>Aplicados a los mismos datos de Nueva York, los cuatro ajustes mueven el Gini de la ciudad de 54,7 a 45,0. Uno de ellos hace casi todo el trabajo: 5,8 de los 9,7 puntos son solo impuestos.</figcaption>
</figure>

El impuesto es el grande, y el más fácil de describir. Para cada hogar de la ciudad, se pasa su renta por el código fiscal y se mira lo que queda de verdad:

<div class="formula">
  <p class="eq">renta neta = renta monetaria − impuesto sobre la renta − cotizaciones sociales + deducciones reembolsables</p>
  <p class="note">El impuesto sobre la renta es la suma del federal, el del estado de Nueva York y el de la ciudad. Las cotizaciones son la parte que paga la persona trabajadora para la Seguridad Social y Medicare. Las deducciones reembolsables son los créditos por rentas del trabajo y por hijos, que en los hogares de renta baja pagan más de lo que el hogar debe.</p>
</div>

<figure class="figure">
  <img src="/journal/gini/17_tax_model.png" alt="Gráfico de barras del tipo efectivo por decil de renta del hogar en Nueva York, que va del menos 7 % en el décimo más pobre al más 37 % en el más rico." loading="lazy" />
  <figcaption>El décimo más pobre de los hogares neoyorquinos recibe más de lo que paga. El décimo más rico paga el 37 % de su renta. La cifra española ya lleva esto hecho, y la estadounidense no.</figcaption>
</figure>

## El dato curioso

En algún punto del modelo fiscal fui a buscar las ganancias patrimoniales en los datos estadounidenses y no las encontré.

No están. La American Community Survey, la encuesta detrás de prácticamente toda estadística de renta a nivel de barrio en Estados Unidos, pregunta por salarios, trabajo por cuenta propia, intereses, dividendos, alquileres, pensiones y prestaciones. No pregunta por las ganancias patrimoniales. Están excluidas por definición de lo que la Oficina del Censo llama "money income".

Lo que significa que la mayor fuente de ingresos en el extremo superior de la distribución estadounidense falta en la estadística que Estados Unidos usa para medir su propia desigualdad. ([CBO, 2022](https://www.cbo.gov/publication/62300))

La agencia tributaria estadounidense, el Internal Revenue Service (IRS), sabe exactamente qué ganancias patrimoniales se realizaron y quién las tuvo. Ese fichero simplemente nunca se encuentra con la encuesta de la Oficina del Censo de Estados Unidos. España lo consigue todo en un solo número anual porque la Agencia Tributaria le entrega los datos al instituto de estadística.

Consecuencia práctica: toda cifra de Estados Unidos que aparece a continuación es un **suelo**. Tal y como funciona la riqueza en Estados Unidos, el número real debería ser más alto.

## El experimento

Los mapas originales usan rangos de color distintos, así que el mismo color no representa el mismo valor de Gini en las dos ciudades.

Los mapas de abajo aplican los cortes de color de cada ciudad a los datos de la otra.

<figure class="figure gini-fig">
  <input type="radio" name="scale-nyc" id="scale-nyc-a" class="sa" checked />
  <input type="radio" name="scale-nyc" id="scale-nyc-b" class="sb" />
  <p class="figure-title">Nueva York, leída dos veces</p>
  <p class="figure-sub">Las mismas 2.208 secciones censales, sobre el concepto de renta español. Solo cambian los cortes de clase.</p>
  <div class="gini-tabs">
    <label for="scale-nyc-a" data-for="a">En la escala de A Coruña</label>
    <label for="scale-nyc-b" data-for="b">En su propia escala</label>
  </div>
  <div class="gini-body">
    <div class="gini-pane pane-a">
      <img src="/journal/gini/map-nyc-a.svg" alt="Mapa de las secciones censales de Nueva York clasificadas con los cortes de Gini de A Coruña. Casi toda la ciudad queda en la clase más oscura." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 27,1</li>
        <li><i class="k2"></i>27,1–29,3</li>
        <li><i class="k3"></i>29,3–31,0</li>
        <li><i class="k4"></i>31,0–32,5</li>
        <li><i class="k5"></i>32,5 o más</li>
        <li><i class="k0"></i>sin datos</li>
      </ul>
    </div>
    <div class="gini-pane pane-b">
      <img src="/journal/gini/map-nyc-b.svg" alt="El mismo mapa de Nueva York clasificado con sus propios quintiles de Gini, mostrando una variación detallada por toda la ciudad." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 31,4</li>
        <li><i class="k2"></i>31,4–34,7</li>
        <li><i class="k3"></i>34,7–37,7</li>
        <li><i class="k4"></i>37,7–41,4</li>
        <li><i class="k5"></i>41,4 o más</li>
        <li><i class="k0"></i>sin datos</li>
      </ul>
    </div>
  </div>
  <figcaption>Índice de Gini por sección censal, US Census Bureau, ACS 2019–2023, armonizado a la definición española. En gris: parques, aeropuertos y cementerios, o unidades demasiado pequeñas para publicar.</figcaption>
</figure>

En la escala de A Coruña, la ciudad es prácticamente de un solo color. **Tres cuartas partes de las secciones censales de Nueva York caen en la clase más alta**, la franja que A Coruña reserva para su quinto más desigual. Cambia a su propia escala y todo el detalle vuelve. Las mismas secciones y los mismos números, en los dos casos.

Hazlo al revés y A Coruña se vuelve casi toda azul.

<figure class="figure gini-fig">
  <input type="radio" name="scale-cor" id="scale-cor-a" class="sa" checked />
  <input type="radio" name="scale-cor" id="scale-cor-b" class="sb" />
  <p class="figure-title">A Coruña, leída dos veces</p>
  <p class="figure-sub">Las mismas 186 secciones censales y los mismos valores. Solo cambian los cortes de clase.</p>
  <div class="gini-tabs">
    <label for="scale-cor-a" data-for="a">En su propia escala</label>
    <label for="scale-cor-b" data-for="b">En la escala de Nueva York</label>
  </div>
  <div class="gini-body">
    <div class="gini-pane pane-a">
      <img src="/journal/gini/map-coruna-a.svg" alt="Mapa de las secciones censales de A Coruña clasificadas con sus propios quintiles de Gini, con una gama completa de colores por la ciudad." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 27,1</li>
        <li><i class="k2"></i>27,1–29,3</li>
        <li><i class="k3"></i>29,3–31,0</li>
        <li><i class="k4"></i>31,0–32,5</li>
        <li><i class="k5"></i>32,5 o más</li>
      </ul>
    </div>
    <div class="gini-pane pane-b">
      <img src="/journal/gini/map-coruna-b.svg" alt="El mismo mapa de A Coruña clasificado con los cortes de Gini de Nueva York. Dos tercios de la ciudad caen en la clase más igualitaria." loading="lazy" />
      <ul class="gini-legend">
        <li><i class="k1"></i>menos de 31,4</li>
        <li><i class="k2"></i>31,4–34,7</li>
        <li><i class="k3"></i>34,7–37,7</li>
        <li><i class="k4"></i>37,7–41,4</li>
        <li><i class="k5"></i>41,4 o más</li>
      </ul>
    </div>
  </div>
  <figcaption>Índice de Gini por sección censal, INE, Atlas de Distribución de Renta de los Hogares, 2023. En la escala de Nueva York, dos tercios de A Coruña colapsan en una única clase, la más igualitaria.</figcaption>
</figure>

## Hallazgos

La desigualdad se acumula en el centro denso, viejo y mezclado. En los dos mapas el rojo se asienta en el núcleo de poblamiento antiguo y se va diluyendo hacia los bordes: el mismo patrón en Galicia que en Nueva York, al mismo grano.

Nueva York podría reflejar una tendencia más amplia de desigualdad más extrema en Estados Unidos. Esa tendencia resulta más difícil de ver porque lo que suele ser una fuente de riqueza para quienes más ganan, las ganancias patrimoniales, no aparecen en los datos de la encuesta estadounidense.

Los valores altos de Gini cubren mucha más parte de las secciones censales de Nueva York que de las de A Coruña.

<figure class="figure">
  <img src="/journal/gini/15_neighbourhood_comparison.png" alt="Gráfico de puntos que sitúa los diez distritos censales de A Coruña a lo largo de la distribución de 196 áreas de barrio de Nueva York según su Gini mediano." loading="lazy" />
  <figcaption>Los diez distritos de A Coruña soltados en la distribución de las 196 áreas de barrio de Nueva York, próximas a los distritos coruñeses en población. Solo el 9 % de los barrios neoyorquinos son más igualitarios que el distrito mediano de A Coruña; pero un 34 % lo son más que el distrito coruñés más desigual. Las dos ciudades se solapan; no se superponen.</figcaption>
</figure>

## Lo que esto no resuelve

**La escala.** A Coruña tiene 245.000 habitantes; Nueva York, 8,8 millones. La escala mueve los mercados de la vivienda, la segregación y la distancia social de maneras que ningún coeficiente toca. Mi intuición es que Madrid y Barcelona se parecerían más a Nueva York que a A Coruña en este terreno, pero es una intuición: no está en estos datos.

**Ganancias patrimoniales.** Mientras las ganancias patrimoniales estadounidenses no lleguen a las estadísticas de barrio, toda cifra de Estados Unidos aquí es un mínimo.

**Dispersión y contexto.** El Gini describe lo estirada que está la renta dentro de un área, y depende por completo del contexto. Dos barrios, en ciudades distintas, pueden puntuar igual y no parecerse en nada.

**Bienestar.** Este marco es mi propia lectura, no algo que midan los números de arriba. Los impuestos de A Coruña financian escuelas infantiles, universidad, sanidad, transporte y una pensión con la que se puede vivir, y los de Nueva York en su mayoría no compran las mismas cosas. Si eso es cierto, rentas que parecen iguales en las dos ciudades no son vidas iguales, y ninguna armonización arregla eso.

---

*Datos españoles: INE, Atlas de Distribución de Renta de los Hogares, 2023. Datos estadounidenses: US Census Bureau, ACS 2019–2023 y microdatos PUMS. El método, las fuentes y la lista completa de limitaciones están documentados junto con el código.*
