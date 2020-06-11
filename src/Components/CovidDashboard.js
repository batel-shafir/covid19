import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress } from '@material-ui/core';
 
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
            setCountries(countriesNames.filter(country => country.name != 'united-states'));
        };
        fetchCountries().then(null);
    }, []);
  
   
    useEffect(() => {
        async function fetchAmounts() {
            const arr = await Promise.all(countries.map(country => getNumberByCountry(country.name,country.code)));
            const sortedArr = arr.sort((a, b) => {
                return b.confirmedCases - a.confirmedCases;
            });
            const top10Confirmed = sortedArr.slice(0,10);
            setTop10Countries(top10Confirmed);
           
        }
        if (countries.length > 0) {
            fetchAmounts().then(null);
        }
    },[countries]
    );

  

  
  return (
    <div className="data-container">           
        {isLoading ? 
            <div className="centered">
            <CircularProgress></CircularProgress>
            </div> :
        top10Countries.map(x => {
            return (
                <div>
                    <div>{ x.name }</div>
                    <div>{ x.confirmedCases }</div>
                    <img src={`https://www.countryflags.io/${x.code}/flat/64.png`}/>
                </div>) 
        })}         
        </div>
    
    
  );
}
 
export default CovidDashboard;