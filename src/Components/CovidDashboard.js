import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress } from '@material-ui/core';
import './CovidDashboard.css';

 
export async function getNumberByCountry (country, code) {
    const firstDay =  await axios.get(`https://api.covid19api.com/country/${country}/status/confirmed?from=2020-03-11T00:00:00Z&to=2020-03-11T23:59:59Z`);
    const lastDay = await axios.get(`https://api.covid19api.com/country/${country}/status/confirmed?from=2020-06-11T00:00:00Z&to=2020-06-11T23:59:59Z`);
    return ({
        name: country,
        confirmedCases: firstDay.data[0].Cases - lastDay.data[0].Cases,
        code:code
    });
}

function CovidDashboard(props) {
    const [countries, setCountries] = useState([]); 
    const [top10Countries, setTop10Countries] = useState([]);
    const isLoading = top10Countries.length === 0;
    
    useEffect(() => {
        const fetchCountries = async () => {
            const response = await axios.get('https://api.covid19api.com/summary');
            const countriesNames = response.data.Countries.map(country => {return({name:country.Slug, code:country.CountryCode.toLowerCase() })});
            console.log(countriesNames);
            setCountries(countriesNames.filter(country => country.name !== 'united-states'));
        };
        fetchCountries().then(null);
    }, []);
  
   
    useEffect(() => {
        const gotCountriesNames = countries.length > 0;

        async function fetchNumberOfCases() {
            const countriesWithConfirmedCases = await Promise.all(countries.map(country => getNumberByCountry(country.name,country.code)));
            const sortedArr = countriesWithConfirmedCases.sort((a, b) => {
                return b.confirmedCases - a.confirmedCases;
            });
            const top10ConfirmedCountries = sortedArr.slice(0,10);
            setTop10Countries(top10ConfirmedCountries);   
        }
        
        gotCountriesNames && fetchNumberOfCases().then(null);
        
    },[countries]
    );


  return (
    <div className="data-container">           
        {isLoading && 
            <div className="centered">
                <div className="loading-header">Fetching the data...</div>
                <CircularProgress></CircularProgress>
        </div>}
        {!isLoading &&
         
        <div className="countries-container">
            <div className="countries-header">
                10 countries with highest amount of confirmed cases in the past 3 months
            </div>
            {top10Countries.map(country => {
                return (     
                    <div className="country-info">
                        <div>{ country.name }</div>
                        <div>{ country.confirmedCases }</div>
                        <img alt="flag" src={`https://www.countryflags.io/${country.code}/flat/64.png`}/>
                    </div>)
                
            })}  
        </div> }     
        </div>
    
    
  );
}
 
export default CovidDashboard;