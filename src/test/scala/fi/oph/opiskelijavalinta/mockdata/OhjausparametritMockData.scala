package fi.oph.opiskelijavalinta.mockdata

import fi.oph.opiskelijavalinta.model.{DateParam, OhjausparametritRaw}

object OhjausparametritMockData {

  val mennytTimestamp          = 1599657520000L
  val paattynytHakukierrosMock = Some(
    OhjausparametritRaw(
      PH_HKP = Some(DateParam(Some(mennytTimestamp))),
      PH_IP = None,
      PH_VTJH = None,
      PH_EVR = None,
      PH_OPVP = None,
      PH_VSTP = None,
      None,
      None
    )
  )

  val hakukierrosPaattyyTulevaisuudessaMock = Some(
    OhjausparametritRaw(
      PH_HKP = Some(DateParam(Some(System.currentTimeMillis() + 1000000L))),
      PH_IP = None,
      PH_VTJH = None,
      PH_EVR = None,
      PH_OPVP = None,
      PH_VSTP = None,
      None,
      None
    )
  )

}
