'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabase'
import Navbar from '../../Navbar'

const UBICACIONES = [
  'AMAZONAS - BAGUA - BAGUA',
  'AMAZONAS - BAGUA - ARAMANGO',
  'AMAZONAS - BAGUA - COPALLIN',
  'AMAZONAS - BAGUA - EL PARCO',
  'AMAZONAS - BAGUA - IMAZA',
  'AMAZONAS - BAGUA - LA PECA',
  'AMAZONAS - BONGARA - JUMBILLA',
  'AMAZONAS - BONGARA - CHISQUILLA',
  'AMAZONAS - BONGARA - CHURUJA',
  'AMAZONAS - BONGARA - COROSHA',
  'AMAZONAS - BONGARA - CUISPES',
  'AMAZONAS - BONGARA - FLORIDA',
  'AMAZONAS - BONGARA - JAZÁN',
  'AMAZONAS - BONGARA - RECTA',
  'AMAZONAS - BONGARA - SAN CARLOS',
  'AMAZONAS - BONGARA - SHIPASBAMBA',
  'AMAZONAS - BONGARA - VALERA',
  'AMAZONAS - BONGARA - YAMBRASBAMBA',
  'AMAZONAS - CHACHAPOYAS - CHACHAPOYAS',
  'AMAZONAS - CHACHAPOYAS - ASUNCION',
  'AMAZONAS - CHACHAPOYAS - BALSAS',
  'AMAZONAS - CHACHAPOYAS - CHETO',
  'AMAZONAS - CHACHAPOYAS - CHILIQUIN',
  'AMAZONAS - CHACHAPOYAS - CHUQUIBAMBA',
  'AMAZONAS - CHACHAPOYAS - GRANADA',
  'AMAZONAS - CHACHAPOYAS - HUANCAS',
  'AMAZONAS - CHACHAPOYAS - LA JALCA',
  'AMAZONAS - CHACHAPOYAS - LEIMEBAMBA',
  'AMAZONAS - CHACHAPOYAS - LEVANTO',
  'AMAZONAS - CHACHAPOYAS - MAGDALENA',
  'AMAZONAS - CHACHAPOYAS - MARISCAL CASTILLA',
  'AMAZONAS - CHACHAPOYAS - MOLINOPAMPA',
  'AMAZONAS - CHACHAPOYAS - MONTEVIDEO',
  'AMAZONAS - CHACHAPOYAS - OLLEROS',
  'AMAZONAS - CHACHAPOYAS - QUINJALCA',
  'AMAZONAS - CHACHAPOYAS - SAN FRANCISCO DE DAGUAS',
  'AMAZONAS - CHACHAPOYAS - SAN ISIDRO DE MAINO',
  'AMAZONAS - CHACHAPOYAS - SOLOCO',
  'AMAZONAS - CHACHAPOYAS - SONCHE',
  'ANCASH - HUARAZ - HUARAZ',
  'ANCASH - HUARAZ - COCHABAMBA',
  'ANCASH - HUARAZ - COLCABAMBA',
  'ANCASH - HUARAZ - HUANCHAY',
  'ANCASH - HUARAZ - INDEPENDENCIA',
  'ANCASH - HUARAZ - JANGAS',
  'ANCASH - HUARAZ - LA LIBERTAD',
  'ANCASH - HUARAZ - OLLEROS',
  'ANCASH - HUARAZ - PAMPAS',
  'ANCASH - HUARAZ - PARIA',
  'ANCASH - HUARAZ - TARICA',
  'ANCASH - SANTA - CHIMBOTE',
  'ANCASH - SANTA - COISHCO',
  'ANCASH - SANTA - MACATE',
  'ANCASH - SANTA - MORO',
  'ANCASH - SANTA - NEPEÑA',
  'ANCASH - SANTA - NUEVO CHIMBOTE',
  'ANCASH - SANTA - SAMANCO',
  'ANCASH - SANTA - SANTA',
  'APURIMAC - ABANCAY - ABANCAY',
  'APURIMAC - ABANCAY - CHACOCHE',
  'APURIMAC - ABANCAY - CIRCA',
  'APURIMAC - ABANCAY - CURAHUASI',
  'APURIMAC - ABANCAY - HUANIPACA',
  'APURIMAC - ABANCAY - LAMBRAMA',
  'APURIMAC - ABANCAY - PICHIRHUA',
  'APURIMAC - ABANCAY - SAN PEDRO DE CACHORA',
  'APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS',
  'APURIMAC - ANDAHUAYLAS - ANDARAPA',
  'APURIMAC - ANDAHUAYLAS - CHIARA',
  'APURIMAC - ANDAHUAYLAS - HUANCARAMA',
  'APURIMAC - ANDAHUAYLAS - HUANCARAY',
  'APURIMAC - ANDAHUAYLAS - KAQUIABAMBA',
  'APURIMAC - ANDAHUAYLAS - KISHUARA',
  'APURIMAC - ANDAHUAYLAS - PACOBAMBA',
  'APURIMAC - ANDAHUAYLAS - PACUCHA',
  'APURIMAC - ANDAHUAYLAS - PAMPACHIRI',
  'APURIMAC - ANDAHUAYLAS - POMACOCHA',
  'APURIMAC - ANDAHUAYLAS - SAN ANTONIO DE CACHI',
  'APURIMAC - ANDAHUAYLAS - SAN JERÓNIMO',
  'APURIMAC - ANDAHUAYLAS - SAN MIGUEL DE CHACCRAMPA',
  'APURIMAC - ANDAHUAYLAS - SANTA MARIA DE CHICMO',
  'APURIMAC - ANDAHUAYLAS - TALAVERA',
  'APURIMAC - ANDAHUAYLAS - TUMAY HUARACA',
  'APURIMAC - ANDAHUAYLAS - TURPO',
  'AREQUIPA - AREQUIPA - AREQUIPA',
  'AREQUIPA - AREQUIPA - ALTO SELVA ALEGRE',
  'AREQUIPA - AREQUIPA - CAYMA',
  'AREQUIPA - AREQUIPA - CERRO COLORADO',
  'AREQUIPA - AREQUIPA - CHARACATO',
  'AREQUIPA - AREQUIPA - CHIGUATA',
  'AREQUIPA - AREQUIPA - JACOBO HUNTER',
  'AREQUIPA - AREQUIPA - LA JOYA',
  'AREQUIPA - AREQUIPA - MARIANO MELGAR',
  'AREQUIPA - AREQUIPA - MIRAFLORES',
  'AREQUIPA - AREQUIPA - MOLLEBAYA',
  'AREQUIPA - AREQUIPA - PAUCARPATA',
  'AREQUIPA - AREQUIPA - POCSI',
  'AREQUIPA - AREQUIPA - POLOBAYA',
  'AREQUIPA - AREQUIPA - QUEQUEÑA',
  'AREQUIPA - AREQUIPA - SABANDIA',
  'AREQUIPA - AREQUIPA - SACHACA',
  'AREQUIPA - AREQUIPA - SAN JUAN DE SIGUAS',
  'AREQUIPA - AREQUIPA - SAN JUAN DE TARUCANI',
  'AREQUIPA - AREQUIPA - SANTA ISABEL DE SIGUAS',
  'AREQUIPA - AREQUIPA - SANTA RITA DE SIGUAS',
  'AREQUIPA - AREQUIPA - SOCABAYA',
  'AREQUIPA - AREQUIPA - TIABAYA',
  'AREQUIPA - AREQUIPA - UCHUMAYO',
  'AREQUIPA - AREQUIPA - VITOR',
  'AREQUIPA - AREQUIPA - YANAHUARA',
  'AREQUIPA - AREQUIPA - YARABAMBA',
  'AREQUIPA - AREQUIPA - YURA',
  'AYACUCHO - HUAMANGA - AYACUCHO',
  'AYACUCHO - HUAMANGA - ACOCRO',
  'AYACUCHO - HUAMANGA - ACOS VINCHOS',
  'AYACUCHO - HUAMANGA - CARMEN ALTO',
  'AYACUCHO - HUAMANGA - CHIARA',
  'AYACUCHO - HUAMANGA - JESUS NAZARENO',
  'AYACUCHO - HUAMANGA - OCROS',
  'AYACUCHO - HUAMANGA - PACAYCASA',
  'AYACUCHO - HUAMANGA - QUINUA',
  'AYACUCHO - HUAMANGA - SAN JOSE DE TICLLAS',
  'AYACUCHO - HUAMANGA - SAN JUAN BAUTISTA',
  'AYACUCHO - HUAMANGA - SANTIAGO DE PISCHA',
  'AYACUCHO - HUAMANGA - SOCOS',
  'AYACUCHO - HUAMANGA - TAMBILLO',
  'AYACUCHO - HUAMANGA - VINCHOS',
  'CAJAMARCA - CAJAMARCA - CAJAMARCA',
  'CAJAMARCA - CAJAMARCA - ASUNCION',
  'CAJAMARCA - CAJAMARCA - CHETILLA',
  'CAJAMARCA - CAJAMARCA - COSPAN',
  'CAJAMARCA - CAJAMARCA - ENCAÑADA',
  'CAJAMARCA - CAJAMARCA - JESUS',
  'CAJAMARCA - CAJAMARCA - LLACANORA',
  'CAJAMARCA - CAJAMARCA - LOS BAÑOS DEL INCA',
  'CAJAMARCA - CAJAMARCA - MAGDALENA',
  'CAJAMARCA - CAJAMARCA - MATARA',
  'CAJAMARCA - CAJAMARCA - NAMORA',
  'CAJAMARCA - CAJAMARCA - SAN JUAN',
  'CALLAO - CALLAO - BELLAVISTA',
  'CALLAO - CALLAO - CALLAO',
  'CALLAO - CALLAO - CARMEN DE LA LEGUA REYNOSO',
  'CALLAO - CALLAO - LA PERLA',
  'CALLAO - CALLAO - LA PUNTA',
  'CALLAO - CALLAO - MI PERU',
  'CALLAO - CALLAO - VENTANILLA',
  'CUSCO - CUSCO - CUSCO',
  'CUSCO - CUSCO - CCORCA',
  'CUSCO - CUSCO - POROY',
  'CUSCO - CUSCO - SAN JERÓNIMO',
  'CUSCO - CUSCO - SAN SEBASTIÁN',
  'CUSCO - CUSCO - SANTIAGO',
  'CUSCO - CUSCO - SAYLLA',
  'CUSCO - CUSCO - WANCHAQ',
  'CUSCO - LA CONVENCION - SANTA ANA',
  'CUSCO - LA CONVENCION - ECHARATE',
  'CUSCO - LA CONVENCION - HUAYOPATA',
  'CUSCO - LA CONVENCION - MARANURA',
  'CUSCO - LA CONVENCION - OCOBAMBA',
  'CUSCO - LA CONVENCION - QUELLOUNO',
  'CUSCO - LA CONVENCION - VILCABAMBA',
  'HUANCAVELICA - HUANCAVELICA - HUANCAVELICA',
  'HUANCAVELICA - HUANCAVELICA - ACOBAMBILLA',
  'HUANCAVELICA - HUANCAVELICA - ACORIA',
  'HUANCAVELICA - HUANCAVELICA - CONAYCA',
  'HUANCAVELICA - HUANCAVELICA - CUENCA',
  'HUANCAVELICA - HUANCAVELICA - HUACHOCOLPA',
  'HUANCAVELICA - HUANCAVELICA - HUAYLLAHUARA',
  'HUANCAVELICA - HUANCAVELICA - IZCUCHACA',
  'HUANCAVELICA - HUANCAVELICA - LARIA',
  'HUANCAVELICA - HUANCAVELICA - MANTA',
  'HUANCAVELICA - HUANCAVELICA - MARISCAL CACERES',
  'HUANCAVELICA - HUANCAVELICA - MOYA',
  'HUANCAVELICA - HUANCAVELICA - NUEVO OCCORO',
  'HUANCAVELICA - HUANCAVELICA - PALCA',
  'HUANCAVELICA - HUANCAVELICA - VILCA',
  'HUANUCO - HUANUCO - HUANUCO',
  'HUANUCO - HUANUCO - AMARILIS',
  'HUANUCO - HUANUCO - CHINCHAO',
  'HUANUCO - HUANUCO - CHURUBAMBA',
  'HUANUCO - HUANUCO - MARGOS',
  'HUANUCO - HUANUCO - PILLCO MARCA',
  'HUANUCO - HUANUCO - QUISQUI',
  'HUANUCO - HUANUCO - SAN FRANCISCO DE CAYRAN',
  'HUANUCO - HUANUCO - SAN PEDRO DE CHAULAN',
  'HUANUCO - HUANUCO - SANTA MARIA DEL VALLE',
  'HUANUCO - HUANUCO - YARUMAYO',
  'ICA - ICA - ICA',
  'ICA - ICA - LA TINGUIÑA',
  'ICA - ICA - LOS AQUIJES',
  'ICA - ICA - OCUCAJE',
  'ICA - ICA - PACHACUTEC',
  'ICA - ICA - PARCONA',
  'ICA - ICA - PUEBLO NUEVO',
  'ICA - ICA - SALAS',
  'ICA - ICA - SAN JOSE DE LOS MOLINOS',
  'ICA - ICA - SAN JUAN BAUTISTA',
  'ICA - ICA - SANTIAGO',
  'ICA - ICA - SUBTANJALLA',
  'ICA - ICA - TATE',
  'ICA - ICA - YAUCA DEL ROSARIO',
  'ICA - CHINCHA - CHINCHA ALTA',
  'ICA - CHINCHA - ALTO LARAN',
  'ICA - CHINCHA - CHAVÍN',
  'ICA - CHINCHA - EL CARMEN',
  'ICA - CHINCHA - GROCIO PRADO',
  'ICA - CHINCHA - PUEBLO NUEVO',
  'ICA - CHINCHA - SAN JUAN DE YANAC',
  'ICA - CHINCHA - SAN PEDRO DE HUACARPANA',
  'ICA - CHINCHA - SUNAMPE',
  'ICA - CHINCHA - TAMBO DE MORA',
  'ICA - NAZCA - NAZCA',
  'ICA - NAZCA - CHANGUILLO',
  'ICA - NAZCA - EL INGENIO',
  'ICA - NAZCA - MARCONA',
  'ICA - NAZCA - VISTA ALEGRE',
  'ICA - PISCO - PISCO',
  'ICA - PISCO - HUANCANO',
  'ICA - PISCO - HUMAY',
  'ICA - PISCO - INDEPENDENCIA',
  'ICA - PISCO - PARACAS',
  'ICA - PISCO - SAN ANDRES',
  'ICA - PISCO - SAN CLEMENTE',
  'ICA - PISCO - TUPAC AMARU INCA',
  'JUNIN - HUANCAYO - HUANCAYO',
  'JUNIN - HUANCAYO - CARHUACALLANGA',
  'JUNIN - HUANCAYO - CHACAPAMPA',
  'JUNIN - HUANCAYO - CHICCHE',
  'JUNIN - HUANCAYO - CHILCA',
  'JUNIN - HUANCAYO - CHONGOS ALTO',
  'JUNIN - HUANCAYO - CHUPURO',
  'JUNIN - HUANCAYO - COLCA',
  'JUNIN - HUANCAYO - CULLHUAS',
  'JUNIN - HUANCAYO - EL TAMBO',
  'JUNIN - HUANCAYO - HUACRAPUQUIO',
  'JUNIN - HUANCAYO - HUALHUAS',
  'JUNIN - HUANCAYO - HUANCAN',
  'JUNIN - HUANCAYO - HUASICANCHA',
  'JUNIN - HUANCAYO - HUAYUCACHI',
  'JUNIN - HUANCAYO - INGENIO',
  'JUNIN - HUANCAYO - PARIAHUANCA',
  'JUNIN - HUANCAYO - PUCARA',
  'JUNIN - HUANCAYO - QUILCAS',
  'JUNIN - HUANCAYO - SAN AGUSTIN',
  'JUNIN - HUANCAYO - SAN JERONIMO DE TUNAN',
  'JUNIN - HUANCAYO - SAÑO',
  'JUNIN - HUANCAYO - SAPALLANGA',
  'JUNIN - HUANCAYO - SICAYA',
  'JUNIN - HUANCAYO - VIQUES',
  'LA LIBERTAD - TRUJILLO - TRUJILLO',
  'LA LIBERTAD - TRUJILLO - EL PORVENIR',
  'LA LIBERTAD - TRUJILLO - FLORENCIA DE MORA',
  'LA LIBERTAD - TRUJILLO - HUANCHACO',
  'LA LIBERTAD - TRUJILLO - LA ESPERANZA',
  'LA LIBERTAD - TRUJILLO - LAREDO',
  'LA LIBERTAD - TRUJILLO - MOCHE',
  'LA LIBERTAD - TRUJILLO - POROTO',
  'LA LIBERTAD - TRUJILLO - SALAVERRY',
  'LA LIBERTAD - TRUJILLO - SIMBAL',
  'LA LIBERTAD - TRUJILLO - VICTOR LARCO HERRERA',
  'LAMBAYEQUE - CHICLAYO - CHICLAYO',
  'LAMBAYEQUE - CHICLAYO - CAYALTI',
  'LAMBAYEQUE - CHICLAYO - CHONGOYAPE',
  'LAMBAYEQUE - CHICLAYO - ETEN',
  'LAMBAYEQUE - CHICLAYO - ETEN PUERTO',
  'LAMBAYEQUE - CHICLAYO - JOSE LEONARDO ORTIZ',
  'LAMBAYEQUE - CHICLAYO - LA VICTORIA',
  'LAMBAYEQUE - CHICLAYO - LAGUNAS',
  'LAMBAYEQUE - CHICLAYO - MONSEFU',
  'LAMBAYEQUE - CHICLAYO - NUEVA ARICA',
  'LAMBAYEQUE - CHICLAYO - OYOTUN',
  'LAMBAYEQUE - CHICLAYO - PATAPO',
  'LAMBAYEQUE - CHICLAYO - PIMENTEL',
  'LAMBAYEQUE - CHICLAYO - POMALCA',
  'LAMBAYEQUE - CHICLAYO - PUCALA',
  'LAMBAYEQUE - CHICLAYO - REQUE',
  'LAMBAYEQUE - CHICLAYO - SANTA ROSA',
  'LAMBAYEQUE - CHICLAYO - SAÑA',
  'LAMBAYEQUE - CHICLAYO - TUMAN',
  'LIMA - LIMA - ATE',
  'LIMA - LIMA - BARRANCO',
  'LIMA - LIMA - BREÑA',
  'LIMA - LIMA - CARABAYLLO',
  'LIMA - LIMA - CHACLACAYO',
  'LIMA - LIMA - CHORRILLOS',
  'LIMA - LIMA - CIENEGUILLA',
  'LIMA - LIMA - COMAS',
  'LIMA - LIMA - EL AGUSTINO',
  'LIMA - LIMA - INDEPENDENCIA',
  'LIMA - LIMA - JESUS MARIA',
  'LIMA - LIMA - LA MOLINA',
  'LIMA - LIMA - LA VICTORIA',
  'LIMA - LIMA - LINCE',
  'LIMA - LIMA - LOS OLIVOS',
  'LIMA - LIMA - LURIGANCHO',
  'LIMA - LIMA - LURIN',
  'LIMA - LIMA - MAGDALENA DEL MAR',
  'LIMA - LIMA - MIRAFLORES',
  'LIMA - LIMA - PACHACAMAC',
  'LIMA - LIMA - PUCUSANA',
  'LIMA - LIMA - PUEBLO LIBRE',
  'LIMA - LIMA - PUENTE PIEDRA',
  'LIMA - LIMA - PUNTA HERMOSA',
  'LIMA - LIMA - PUNTA NEGRA',
  'LIMA - LIMA - RIMAC',
  'LIMA - LIMA - SAN BARTOLO',
  'LIMA - LIMA - SAN BORJA',
  'LIMA - LIMA - SAN ISIDRO',
  'LIMA - LIMA - SAN JUAN DE LURIGANCHO',
  'LIMA - LIMA - SAN JUAN DE MIRAFLORES',
  'LIMA - LIMA - SAN LUIS',
  'LIMA - LIMA - SAN MARTIN DE PORRES',
  'LIMA - LIMA - SAN MIGUEL',
  'LIMA - LIMA - SANTA ANITA',
  'LIMA - LIMA - SANTA MARIA DEL MAR',
  'LIMA - LIMA - SANTA ROSA',
  'LIMA - LIMA - SANTIAGO DE SURCO',
  'LIMA - LIMA - SURQUILLO',
  'LIMA - LIMA - VILLA EL SALVADOR',
  'LIMA - LIMA - VILLA MARIA DEL TRIUNFO',
  'LIMA - BARRANCA - BARRANCA',
  'LIMA - BARRANCA - PARAMONGA',
  'LIMA - BARRANCA - PATIVILCA',
  'LIMA - BARRANCA - SUPE',
  'LIMA - BARRANCA - SUPE PUERTO',
  'LIMA - CAÑETE - SAN VICENTE DE CAÑETE',
  'LIMA - CAÑETE - ASIA',
  'LIMA - CAÑETE - CALANGO',
  'LIMA - CAÑETE - CERRO AZUL',
  'LIMA - CAÑETE - CHILCA',
  'LIMA - CAÑETE - COAYLLO',
  'LIMA - CAÑETE - IMPERIAL',
  'LIMA - CAÑETE - LUNAHUANA',
  'LIMA - CAÑETE - MALA',
  'LIMA - CAÑETE - NUEVO IMPERIAL',
  'LIMA - CAÑETE - PACARAN',
  'LIMA - CAÑETE - QUILMANA',
  'LIMA - CAÑETE - SAN ANTONIO',
  'LIMA - CAÑETE - SAN LUIS',
  'LIMA - CAÑETE - SANTA CRUZ DE FLORES',
  'LIMA - CAÑETE - ZUÑIGA',
  'LIMA - HUARAL - HUARAL',
  'LIMA - HUARAL - ATAVILLOS ALTO',
  'LIMA - HUARAL - ATAVILLOS BAJO',
  'LIMA - HUARAL - AUCALLAMA',
  'LIMA - HUARAL - CHANCAY',
  'LIMA - HUARAL - IHUARI',
  'LIMA - HUARAL - LAMPIAN',
  'LIMA - HUARAL - PACARAOS',
  'LIMA - HUARAL - SAN MIGUEL DE ACOS',
  'LIMA - HUARAL - SANTA CRUZ DE ANDAMARCA',
  'LIMA - HUARAL - SUMBILCA',
  'LIMA - HUARAL - VEINTISIETE DE NOVIEMBRE',
  'LORETO - MAYNAS - IQUITOS',
  'LORETO - MAYNAS - ALTO NANAY',
  'LORETO - MAYNAS - FERNANDO LORES',
  'LORETO - MAYNAS - INDIANA',
  'LORETO - MAYNAS - LAS AMAZONAS',
  'LORETO - MAYNAS - MAZAN',
  'LORETO - MAYNAS - NAPO',
  'LORETO - MAYNAS - PUNCHANA',
  'LORETO - MAYNAS - TORRES CAUSANA',
  'LORETO - MAYNAS - BELEN',
  'LORETO - MAYNAS - SAN JUAN BAUTISTA',
  'MADRE DE DIOS - TAMBOPATA - PUERTO MALDONADO',
  'MADRE DE DIOS - TAMBOPATA - INAMBARI',
  'MADRE DE DIOS - TAMBOPATA - LAS PIEDRAS',
  'MADRE DE DIOS - TAMBOPATA - LABERINTO',
  'MADRE DE DIOS - MANU - MANU',
  'MADRE DE DIOS - MANU - FITZCARRALD',
  'MADRE DE DIOS - MANU - MADRE DE DIOS',
  'MADRE DE DIOS - MANU - HUEPETUHE',
  'MOQUEGUA - MARISCAL NIETO - MOQUEGUA',
  'MOQUEGUA - MARISCAL NIETO - CARUMAS',
  'MOQUEGUA - MARISCAL NIETO - CUCHUMBAYA',
  'MOQUEGUA - MARISCAL NIETO - SAMEGUA',
  'MOQUEGUA - MARISCAL NIETO - SAN CRISTOBAL',
  'MOQUEGUA - MARISCAL NIETO - TORATA',
  'MOQUEGUA - ILO - ILO',
  'MOQUEGUA - ILO - EL ALGARROBAL',
  'MOQUEGUA - ILO - PACOCHA',
  'PASCO - PASCO - CHAUPIMARCA',
  'PASCO - PASCO - HUACHON',
  'PASCO - PASCO - HUARIACA',
  'PASCO - PASCO - HUAYLLAY',
  'PASCO - PASCO - NINACACA',
  'PASCO - PASCO - PALLANCHACRA',
  'PASCO - PASCO - PAUCARTAMBO',
  'PASCO - PASCO - SAN FRANCISCO DE ASIS DE YARUSYACAN',
  'PASCO - PASCO - SIMON BOLIVAR',
  'PASCO - PASCO - TICLACAYAN',
  'PASCO - PASCO - TINYAHUARCO',
  'PASCO - PASCO - VICCO',
  'PASCO - PASCO - YANACANCHA',
  'PIURA - PIURA - PIURA',
  'PIURA - PIURA - CASTILLA',
  'PIURA - PIURA - CATACAOS',
  'PIURA - PIURA - CURA MORI',
  'PIURA - PIURA - EL TALLAN',
  'PIURA - PIURA - LA ARENA',
  'PIURA - PIURA - LA UNION',
  'PIURA - PIURA - LAS LOMAS',
  'PIURA - PIURA - TAMBO GRANDE',
  'PIURA - PIURA - VEINTISÉIS DE OCTUBRE',
  'PIURA - SULLANA - SULLANA',
  'PIURA - SULLANA - BELLAVISTA',
  'PIURA - SULLANA - IGNACIO ESCUDERO',
  'PIURA - SULLANA - LANCONES',
  'PIURA - SULLANA - MARCAVELICA',
  'PIURA - SULLANA - MIGUEL CHECA',
  'PIURA - SULLANA - QUERECOTILLO',
  'PIURA - SULLANA - SALITRAL',
  'PIURA - TUMBES - TUMBES',
  'PUNO - PUNO - PUNO',
  'PUNO - PUNO - ACORA',
  'PUNO - PUNO - AMANTANI',
  'PUNO - PUNO - ATUNCOLLA',
  'PUNO - PUNO - CAPACHICA',
  'PUNO - PUNO - CHUCUITO',
  'PUNO - PUNO - COATA',
  'PUNO - PUNO - HUATA',
  'PUNO - PUNO - MAÑAZO',
  'PUNO - PUNO - PICHACANI',
  'PUNO - PUNO - PLATERIA',
  'PUNO - PUNO - SAN ANTONIO',
  'PUNO - PUNO - TIQUILLACA',
  'PUNO - PUNO - VILQUE',
  'PUNO - JULIACA - JULIACA',
  'PUNO - SAN ROMAN - CABANA',
  'PUNO - SAN ROMAN - CALAPUJA',
  'PUNO - SAN ROMAN - CARACOTO',
  'SAN MARTIN - SAN MARTIN - TARAPOTO',
  'SAN MARTIN - SAN MARTIN - ALBERTO LEVEAU',
  'SAN MARTIN - SAN MARTIN - CACATACHI',
  'SAN MARTIN - SAN MARTIN - CHAZUTA',
  'SAN MARTIN - SAN MARTIN - CHIPURANA',
  'SAN MARTIN - SAN MARTIN - EL PORVENIR',
  'SAN MARTIN - SAN MARTIN - HUIMBAYOC',
  'SAN MARTIN - SAN MARTIN - JUAN GUERRA',
  'SAN MARTIN - SAN MARTIN - LA BANDA DE SHILCAYO',
  'SAN MARTIN - SAN MARTIN - MORALES',
  'SAN MARTIN - SAN MARTIN - PAPAPLAYA',
  'SAN MARTIN - SAN MARTIN - SAN ANTONIO',
  'SAN MARTIN - SAN MARTIN - SAUCE',
  'SAN MARTIN - SAN MARTIN - SHAPAJA',
  'TACNA - TACNA - TACNA',
  'TACNA - TACNA - ALTO DE LA ALIANZA',
  'TACNA - TACNA - CALANA',
  'TACNA - TACNA - CIUDAD NUEVA',
  'TACNA - TACNA - INCLAN',
  'TACNA - TACNA - PACHIA',
  'TACNA - TACNA - PALCA',
  'TACNA - TACNA - POCOLLAY',
  'TACNA - TACNA - SAMA',
  'TACNA - TACNA - CORONEL GREGORIO ALBARRACIN LANCHIPA',
  'TUMBES - TUMBES - TUMBES',
  'TUMBES - TUMBES - CORRALES',
  'TUMBES - TUMBES - LA CRUZ',
  'TUMBES - TUMBES - PAMPAS DE HOSPITAL',
  'TUMBES - TUMBES - SAN JACINTO',
  'TUMBES - TUMBES - SAN JUAN DE LA VIRGEN',
  'UCAYALI - CORONEL PORTILLO - CALLERIA',
  'UCAYALI - CORONEL PORTILLO - CAMPOVERDE',
  'UCAYALI - CORONEL PORTILLO - IPARIA',
  'UCAYALI - CORONEL PORTILLO - MASISEA',
  'UCAYALI - CORONEL PORTILLO - YARINACOCHA',
  'UCAYALI - CORONEL PORTILLO - NUEVA REQUENA',
  'UCAYALI - CORONEL PORTILLO - MANANTAY',
]

export default function NuevoRemate() {
  const [tipo, setTipo] = useState('subasta')
  const [permiteOfertas, setPermiteOfertas] = useState(false)
  const [programarInicio, setProgramarInicio] = useState(false)
  const [creditos, setCreditos] = useState(null)
  const [form, setForm] = useState({
    titulo: '', descripcion: '', precio_inicial: '',
    precio_directo: '', incremento_minimo: '20',
    categoria: '', condicion: 'Como nuevo',
    ubicacion: '', duracion: '3',
    fecha_inicio: '', hora_inicio: ''
  })
  const [fotos, setFotos] = useState([])
  const [fotosUrl, setFotosUrl] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [busquedaUbicacion, setBusquedaUbicacion] = useState('')
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const ubicacionRef = useRef(null)

  const ubicacionesFiltradas = busquedaUbicacion.length >= 2
    ? UBICACIONES.filter(u => u.toLowerCase().includes(busquedaUbicacion.toLowerCase())).slice(0, 20)
    : []

  useEffect(() => {
    async function cargarCreditos() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: cred } = await supabase
        .from('creditos').select('saldo').eq('usuario_id', session.user.id).maybeSingle()
      setCreditos(cred?.saldo ?? 0)
    }
    cargarCreditos()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ubicacionRef.current && !ubicacionRef.current.contains(e.target)) {
        setMostrarDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errores[e.target.name]) setErrores({ ...errores, [e.target.name]: '' })
  }

  function seleccionarUbicacion(ubicacion) {
    setForm({ ...form, ubicacion })
    setBusquedaUbicacion(ubicacion)
    setMostrarDropdown(false)
    if (errores.ubicacion) setErrores({ ...errores, ubicacion: '' })
  }

  function validar() {
    const nuevosErrores = {}
    if (!form.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio.'
    if (!form.categoria) nuevosErrores.categoria = 'La categoría es obligatoria.'
    if (!form.ubicacion) nuevosErrores.ubicacion = 'La ubicación es obligatoria.'
    if (!form.precio_inicial || Number(form.precio_inicial) <= 0) nuevosErrores.precio_inicial = 'El precio inicial debe ser mayor a 0.'
    if (fotos.length === 0) nuevosErrores.fotos = 'Agrega al menos 1 foto.'
    const urlRegex = /(https?:\/\/|www\.)\S+/i
    if (urlRegex.test(form.titulo)) nuevosErrores.titulo = 'El título no puede contener enlaces web.'
    if (urlRegex.test(form.descripcion)) nuevosErrores.descripcion = 'La descripción no puede contener enlaces web.'
    if (form.precio_directo && Number(form.precio_directo) < Number(form.precio_inicial)) {
      nuevosErrores.precio_directo = 'El precio de compra directa no puede ser menor al precio inicial.'
    }
    if (programarInicio) {
      if (!form.fecha_inicio) nuevosErrores.fecha_inicio = 'La fecha de inicio es obligatoria.'
      if (!form.hora_inicio) nuevosErrores.hora_inicio = 'La hora de inicio es obligatoria.'
      if (form.fecha_inicio && form.hora_inicio) {
        const inicioSeleccionado = new Date(form.fecha_inicio + 'T' + form.hora_inicio)
        if (inicioSeleccionado <= new Date()) {
          nuevosErrores.fecha_inicio = 'La fecha y hora de inicio debe ser en el futuro.'
        }
      }
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function publicar() {
    setError('')
    setMensaje('')
    if (!validar()) return
    setCargando(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes ingresar para publicar.'); setCargando(false); return }

    const { data: cred } = await supabase
      .from('creditos').select('saldo').eq('usuario_id', session.user.id).single()
    if (!cred || cred.saldo <= 0) {
      setError('No tienes créditos disponibles para publicar.')
      setCargando(false)
      return
    }

    let fechaInicio = null
    let esInmediato = true
    if (programarInicio && form.fecha_inicio && form.hora_inicio) {
      fechaInicio = new Date(form.fecha_inicio + 'T' + form.hora_inicio)
      esInmediato = false
    }

    const base = fechaInicio || new Date()
    const fechaFin = new Date(base)
    if (tipo === 'subasta') {
      fechaFin.setDate(fechaFin.getDate() + Number(form.duracion))
    } else {
      fechaFin.setDate(fechaFin.getDate() + 30)
    }

    let imagen_url = null
    let imagenes_url = []
    for (let i = 0; i < fotos.length; i++) {
      const nombreArchivo = session.user.id + '_' + Date.now() + '_' + i + '_' + fotos[i].name
      const fd = new FormData()
      fd.append('file', fotos[i])
      fd.append('key', nombreArchivo)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!uploadRes.ok) { setError('Error al subir foto.'); setCargando(false); return }
      const { url } = await uploadRes.json()
      imagenes_url.push(url)
    }
    if (imagenes_url.length > 0) imagen_url = imagenes_url[0]

    const { data: nuevoRemate, error: err } = await supabase.from('remates').insert({
      titulo: form.titulo, descripcion: form.descripcion,
      precio_inicial: Number(form.precio_inicial), precio_actual: Number(form.precio_inicial),
      precio_directo: form.precio_directo ? Number(form.precio_directo) : null,
      incremento_minimo: tipo === 'subasta' ? Number(form.incremento_minimo) : null,
      categoria: form.categoria, condicion: form.condicion,
      ubicacion: form.ubicacion, vendedor_id: session.user.id,
      fecha_fin: fechaFin.toISOString(),
      fecha_inicio: fechaInicio ? fechaInicio.toISOString() : null,
      activo: esInmediato,
      imagen_url, imagenes_url,
      tipo_publicacion: tipo,
      permite_ofertas: tipo === 'precio_fijo' ? permiteOfertas : false,
    }).select().single()
    if (err) {
      if (err.message.includes('precio_positivo')) {
        setError('El precio debe ser mayor a 0.')
      } else {
        setError('Error al publicar: ' + err.message)
      }
      setCargando(false)
      return
    }

    await supabase.from('creditos').update({ saldo: cred.saldo - 1 }).eq('usuario_id', session.user.id)
    setCreditos(cred.saldo - 1)

    if (esInmediato && nuevoRemate) {
      try {
        await fetch('/api/facebook/publicar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: form.titulo, precio: form.precio_inicial,
            categoria: form.categoria, imagen_url,
            remate_id: nuevoRemate.id, tipo
          })
        })
      } catch (e) { console.log('Error publicando en Facebook:', e) }
    }

    if (programarInicio) {
      setMensaje('¡Publicación programada! Se activará el ' + new Date(form.fecha_inicio + 'T' + form.hora_inicio).toLocaleDateString('es-PE', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }))
    } else {
      setMensaje('¡Publicación creada y compartida en Facebook!')
    }
    setTimeout(() => { window.location.href = '/vendedor' }, 2000)
    setCargando(false)
  }

  const sinCreditos = creditos !== null && creditos <= 0
  const hoy = new Date().toISOString().split('T')[0]
  const campo = { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginTop:'5px', boxSizing:'border-box' }
  const campoError = { ...campo, border:'1px solid #E24B4A' }
  const textoError = { fontSize:'12px', color:'#A32D2D', marginTop:'4px' }
  const btnTipo = (activo) => ({
    flex:1, padding:'12px', borderRadius:'8px', border: activo ? '2px solid #1D9E75' : '1px solid #ddd',
    background: activo ? '#E1F5EE' : '#fff', cursor:'pointer', fontSize:'13px',
    fontWeight:'500', color: activo ? '#085041' : '#666'
  })

  return (
    <main style={{ fontFamily:'sans-serif', background:'#f9f9f9', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <a href='/vendedor' style={{ color:'#1D9E75', textDecoration:'none', fontSize:'13px' }}>← Mi panel</a>
          <h1 style={{ fontSize:'18px', fontWeight:'500' }}>Publicar</h1>
        </div>

        {sinCreditos && (
          <div style={{ background:'#FCEBEB', border:'1px solid #E24B4A', borderRadius:'12px', padding:'16px', marginBottom:'16px', textAlign:'center' }}>
            <p style={{ fontSize:'15px', fontWeight:'500', color:'#A32D2D', marginBottom:'6px' }}>Te has quedado sin créditos</p>
            <p style={{ fontSize:'13px', color:'#A32D2D', marginBottom:'12px' }}>Necesitas créditos para publicar.</p>
            <a href='/vendedor' style={{ display:'inline-block', padding:'8px 20px', background:'#A32D2D', color:'white', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'500' }}>
              Recargar créditos
            </a>
          </div>
        )}

        {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{error}</div>}
        {mensaje && <div style={{ background:'#E1F5EE', color:'#085041', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px' }}>{mensaje}</div>}

        {/* TIPO */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'12px' }}>Tipo de publicación</h2>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={() => setTipo('subasta')} style={btnTipo(tipo === 'subasta')}>Subasta</button>
            <button onClick={() => setTipo('precio_fijo')} style={btnTipo(tipo === 'precio_fijo')}>Precio fijo</button>
          </div>
          <p style={{ fontSize:'12px', color:'#999', marginTop:'10px' }}>
            {tipo === 'subasta'
              ? 'Los compradores pujan por tu artículo. Gana quien ofrezca más al terminar el tiempo.'
              : 'Tu artículo se vende al precio que estableces. Vigencia de 30 días.'}
          </p>
          {tipo === 'precio_fijo' && (
            <div style={{ marginTop:'10px', display:'flex', alignItems:'flex-start', gap:'10px' }}>
              <input type='checkbox' id='ofertas' checked={permiteOfertas} onChange={e => setPermiteOfertas(e.target.checked)}
                style={{ width:'16px', height:'16px', cursor:'pointer', accentColor:'#1D9E75', marginTop:'2px', flexShrink:0 }} />
              <label htmlFor='ofertas' style={{ fontSize:'13px', color:'#444', cursor:'pointer', lineHeight:'1.5' }}>
                Permitir que los compradores envíen ofertas por debajo del precio
              </label>
            </div>
          )}
        </div>

        {/* FOTOS */}
        <div style={{ background:'#fff', border: errores.fotos ? '1px solid #E24B4A' : '1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'4px' }}>Fotos del producto</h2>
          <p style={{ fontSize:'12px', color:'#999', marginBottom:'12px' }}>Mínimo 1, máximo 3 fotos</p>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {fotosUrl.map((url, i) => (
              <div key={i} style={{ position:'relative' }}>
                <img src={url} alt='foto' style={{ width:'90px', height:'90px', objectFit:'cover', borderRadius:'8px', border:'1px solid #eee' }} />
                <button onClick={() => { setFotos(fotos.filter((_, j) => j !== i)); setFotosUrl(fotosUrl.filter((_, j) => j !== i)) }}
                  style={{ position:'absolute', top:'-8px', right:'-8px', width:'22px', height:'22px', borderRadius:'50%', background:'#E24B4A', color:'white', border:'none', cursor:'pointer', fontSize:'12px' }}>x</button>
              </div>
            ))}
            {fotos.length < 3 && (
              <label style={{ width:'90px', height:'90px', border:'1px dashed #ddd', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'#f9f9f9', fontSize:'12px', color:'#999' }}>
                <span style={{ fontSize:'24px', marginBottom:'4px' }}>+</span>
                Agregar
                <input type='file' accept='image/*' multiple style={{ display:'none' }} onChange={(e) => {
  const archivos = Array.from(e.target.files)
  const disponibles = 3 - fotos.length
  const nuevos = archivos.slice(0, disponibles)
  if (nuevos.length === 0) return
  setFotos([...fotos, ...nuevos])
  setFotosUrl([...fotosUrl, ...nuevos.map(f => URL.createObjectURL(f))])
  if (errores.fotos) setErrores({ ...errores, fotos: '' })
}} />
              </label>
            )}
          </div>
          {errores.fotos && <p style={textoError}>{errores.fotos}</p>}
        </div>

        {/* INFO PRODUCTO */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'12px' }}>Información del producto</h2>
          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'12px', color: errores.titulo ? '#A32D2D' : '#666' }}>Título *</label>
            <input name='titulo' value={form.titulo} onChange={handleChange} placeholder='Ej: Moneda Peru 1900' style={errores.titulo ? campoError : campo} />
            {errores.titulo && <p style={textoError}>{errores.titulo}</p>}
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'12px', color:'#666' }}>Descripción</label>
            <textarea name='descripcion' value={form.descripcion} onChange={handleChange}
              placeholder='Describe el estado, qué incluye...' style={{ ...campo, height:'80px', resize:'vertical' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div>
              <label style={{ fontSize:'12px', color: errores.categoria ? '#A32D2D' : '#666' }}>Categoría *</label>
              <select name='categoria' value={form.categoria} onChange={handleChange} style={errores.categoria ? campoError : campo}>
                <option value=''>Selecciona</option>
                <option>Antiguedades</option>
                <option>Coleccionables</option>
                <option>Electronica</option>
                <option>Filatelia</option>
                <option>Juguetes</option>
                <option>Numismatica</option>
                <option>Relojes</option>
                <option>Ropa y accesorios</option>
                <option>Otros</option>
              </select>
              {errores.categoria && <p style={textoError}>{errores.categoria}</p>}
            </div>
            <div>
              <label style={{ fontSize:'12px', color:'#666' }}>Condición</label>
              <select name='condicion' value={form.condicion} onChange={handleChange} style={campo}>
                <option>Nuevo</option>
                <option>Como nuevo</option>
                <option>Buen estado</option>
                <option>Usado</option>
              </select>
            </div>
          </div>

          {/* UBICACION CON AUTOCOMPLETADO */}
          <div ref={ubicacionRef} style={{ position:'relative' }}>
            <label style={{ fontSize:'12px', color: errores.ubicacion ? '#A32D2D' : '#666' }}>Ubicación * <span style={{ color:'#999', fontWeight:'400' }}>(donde se encuentra el artículo)</span></label>
            <input
              value={busquedaUbicacion}
              onChange={e => {
                setBusquedaUbicacion(e.target.value)
                setForm({ ...form, ubicacion: '' })
                setMostrarDropdown(true)
                if (errores.ubicacion) setErrores({ ...errores, ubicacion: '' })
              }}
              onFocus={() => setMostrarDropdown(true)}
              placeholder='Escribe para buscar: Lima, Miraflores...'
              style={errores.ubicacion ? campoError : campo}
            />
            {errores.ubicacion && <p style={textoError}>{errores.ubicacion}</p>}
            {mostrarDropdown && ubicacionesFiltradas.length > 0 && (
              <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:'1px solid #ddd', borderRadius:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:100, maxHeight:'220px', overflowY:'auto' }}>
                {ubicacionesFiltradas.map((u, i) => (
                  <div key={i}
                    onMouseDown={() => seleccionarUbicacion(u)}
                    style={{ padding:'10px 14px', fontSize:'13px', cursor:'pointer', borderBottom:'1px solid #f5f5f5', color:'#333' }}
                    onMouseEnter={e => e.target.style.background = '#E1F5EE'}
                    onMouseLeave={e => e.target.style.background = '#fff'}>
                    {u}
                  </div>
                ))}
              </div>
            )}
            {mostrarDropdown && busquedaUbicacion.length >= 2 && ubicacionesFiltradas.length === 0 && (
              <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:'1px solid #ddd', borderRadius:'8px', padding:'12px', fontSize:'13px', color:'#999', zIndex:100 }}>
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>

        {/* CONFIGURACION */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
          <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'12px' }}>
            {tipo === 'subasta' ? 'Configuración de la subasta' : 'Configuración del precio'}
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom: tipo === 'subasta' ? '12px' : '0' }}>
            <div>
              <label style={{ fontSize:'12px', color: errores.precio_inicial ? '#A32D2D' : '#666' }}>
                {tipo === 'subasta' ? 'Precio inicial (S/) *' : 'Precio fijo (S/) *'}
              </label>
              <input name='precio_inicial' type='number' min='1' value={form.precio_inicial} onChange={handleChange}
                placeholder='500' style={errores.precio_inicial ? campoError : campo} />
              {errores.precio_inicial && <p style={textoError}>{errores.precio_inicial}</p>}
            </div>
            {tipo === 'subasta' && (
              <div>
                <label style={{ fontSize:'12px', color:'#666' }}>Incremento mínimo (S/)</label>
                <input name='incremento_minimo' type='number' min='1' value={form.incremento_minimo} onChange={handleChange} placeholder='20' style={campo} />
              </div>
            )}
          </div>
          {tipo === 'subasta' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'12px', color: errores.precio_directo ? '#A32D2D' : '#666' }}>Compra directa (opcional)</label>
                <input name='precio_directo' type='number' min='1' value={form.precio_directo} onChange={handleChange} placeholder='3500' style={errores.precio_directo ? campoError : campo} />
                {errores.precio_directo && <p style={textoError}>{errores.precio_directo}</p>}
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#666' }}>Duración</label>
                <select name='duracion' value={form.duracion} onChange={handleChange} style={campo}>
                  <option value='1'>1 día</option>
                  <option value='3'>3 días</option>
                  <option value='5'>5 días</option>
                  <option value='7'>7 días</option>
                </select>
              </div>
            </div>
          )}
          {tipo === 'precio_fijo' && (
            <p style={{ fontSize:'12px', color:'#999', marginTop:'8px' }}>
              La publicación tendrá una vigencia de 30 días o hasta que alguien compre el artículo.
            </p>
          )}
        </div>

        {/* PROGRAMAR INICIO */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: programarInicio ? '14px' : '0' }}>
            <div>
              <h2 style={{ fontSize:'14px', fontWeight:'500', marginBottom:'2px' }}>Programar inicio</h2>
              <p style={{ fontSize:'12px', color:'#999' }}>Elige cuándo se activa tu publicación</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'12px', color:'#999' }}>{programarInicio ? 'Programado' : 'Inmediato'}</span>
              <button onClick={() => setProgramarInicio(!programarInicio)}
                style={{ width:'44px', height:'24px', borderRadius:'12px', border:'none', cursor:'pointer', background: programarInicio ? '#1D9E75' : '#ddd', position:'relative', transition:'background 0.2s' }}>
                <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'white', position:'absolute', top:'3px', transition:'left 0.2s', left: programarInicio ? '23px' : '3px' }}></div>
              </button>
            </div>
          </div>
          {programarInicio && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'12px', color: errores.fecha_inicio ? '#A32D2D' : '#666' }}>Fecha de inicio *</label>
                <input type='date' name='fecha_inicio' value={form.fecha_inicio} onChange={handleChange}
                  min={hoy} style={errores.fecha_inicio ? campoError : campo} />
                {errores.fecha_inicio && <p style={textoError}>{errores.fecha_inicio}</p>}
              </div>
              <div>
                <label style={{ fontSize:'12px', color: errores.hora_inicio ? '#A32D2D' : '#666' }}>Hora de inicio *</label>
                <input type='time' name='hora_inicio' value={form.hora_inicio} onChange={handleChange}
                  style={errores.hora_inicio ? campoError : campo} />
                {errores.hora_inicio && <p style={textoError}>{errores.hora_inicio}</p>}
              </div>
              {form.fecha_inicio && form.hora_inicio && (
                <div style={{ gridColumn:'1/-1', background:'#E1F5EE', borderRadius:'8px', padding:'10px', fontSize:'12px', color:'#085041' }}>
                  Tu publicación se activará el {new Date(form.fecha_inicio + 'T' + form.hora_inicio).toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={publicar} disabled={cargando || sinCreditos}
          style={{
            width:'100%', padding:'12px',
            background: sinCreditos ? '#ccc' : cargando ? '#9FE1CB' : '#1D9E75',
            color:'white', border:'none', borderRadius:'8px',
            fontSize:'15px', fontWeight:'500',
            cursor: sinCreditos ? 'not-allowed' : 'pointer'
          }}>
          {sinCreditos ? 'Sin créditos para publicar' : cargando ? 'Publicando...' : programarInicio ? 'Programar publicación' : tipo === 'subasta' ? 'Publicar subasta' : 'Publicar a precio fijo'}
        </button>
      </div>
    </main>
  )
}