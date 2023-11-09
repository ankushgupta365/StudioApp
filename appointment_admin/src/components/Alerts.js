import React from 'react'
import {Alert} from 'antd'
const Alerts = () => {
  return (
    < Alert
                         message="Be Careful"
                         description="You can't select more then one slot"
                         type="error"
                         closable
                        //  onClose={onClose}
                         />
  )
}

export default Alerts