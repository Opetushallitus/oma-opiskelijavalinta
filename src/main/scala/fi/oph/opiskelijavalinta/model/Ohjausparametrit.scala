package fi.oph.opiskelijavalinta.model

case class OhjausparametritRaw(
  PH_HKP: Option[DateParam],   // hakukierrosPaattyy
  PH_IP: Option[DateParam],    // ilmoittautuminenPaattyy
  PH_VTJH: Option[DateParam],  // Valintatulosten julkistaminen hakijoille
  PH_EVR: Option[DateParam],   // Ehdolliset valinnat raukeavat
  PH_OPVP: Option[DateParam],  // Opiskelijan paikan vastaanotto päättyy
  PH_VSTP: Option[DateParam],  // Varasijatäyttö päättyy
  sijoittelu: Option[Boolean], // sijoittelu käytössä
  jarjestetytHakutoiveet: Option[Boolean]
)

case class Ohjausparametrit(
  hakukierrosPaattyy: Option[Long],
  ilmoittautuminenPaattyy: Option[Long],
  valintaTuloksetJulkaistaanHakijoille: Option[Long],
  ehdollisetValinnatPaattyy: Option[Long],
  opiskelijanPaikanVastaanottoPaattyy: Option[Long],
  varasijatayttoPaattyy: Option[Long],
  sijoittelu: Option[Boolean],
  jarjestetytHakutoiveet: Option[Boolean]
)

case class DateParam(date: Option[Long])

case class ValueParam(value: Option[Int])
