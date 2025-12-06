import React from 'react'
import './HomePage.css'
import {IoArrowForwardOutline} from 'react-icons/io5'

export default function HomePage() {
  return (
    <div className='home-page-container'>
      
      
      <div className='home-page-header'>
        <h1><img id='beejnex-logo' src='/ICONS/logo-wbg.png' alt="home icon" width={30} />BeejNex</h1>
        <h3>Seed to Shelf , Smarter every step .</h3>
        
      </div>
      <div className='home-getstarted-container'>
        <button className='get-started-btn' onClick={()=>{window.location.href='/signup'}}>Get Started <IoArrowForwardOutline/></button>
      
      </div>
      
      <div className='home-page-lower-container'>
        <div>
          <h4>AI Advisory</h4>
          <p>AI-driven insights to support farmers in making better decisions related to crop selection, pest management, weather planning, and market forecasting.</p>
        </div>
        <div className='feature-2-container'>
          <h4>End to End Connectivity</h4>
          <p>The end-to-end linkage ensures smoother communication, faster coordination, and more efficient movement of goods—from production to delivery—reducing delays and improving overall supply-chain performance.</p>

        </div>
        <div>
          <h4>100% Traceability</h4>
          <p>Enable complete transparency across every stage of the agricultural value chain. By tracking produce from the farm to the final buyer, the system ensures authenticity, quality assurance, and real-time visibility for all stakeholders.</p>
        </div>

      </div>
      
    </div>
  )
}
