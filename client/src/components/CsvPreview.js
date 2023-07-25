import React, { useState, useEffect } from 'react';
import '../stylesheets/csvPreview.css';
import Papa from 'papaparse';

function CsvPreview({ metadata }) {

    //State to store table Column name
    const [tableRows, setTableRows] = useState([]);

    //State to store the values
    const [values, setValues] = useState([]);

    useEffect(() => {
        csvFileToArray(metadata)
    }, []);

    const csvFileToArray = string => {

        Papa.parse(string, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const rowsArray = [];
                const valuesArray = [];

                // Iterating data to get column name and their values
                results.data.map((d) => {
                    rowsArray.push(Object.keys(d));
                    valuesArray.push(Object.values(d));
                });
                // Filtered Column Names
                setTableRows(rowsArray[0]);

                // Filtered Values
                setValues(valuesArray);
            },
        });
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Metadata </h2>
            <div className='table-container'>
                <table>
                    <thead>
                        <tr key={"header"}>
                            {Object.values(tableRows).map((key) => (
                                <th className={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {values.map((item) => (
                            <tr key={item.id}>
                                {Object.values(item).map((val) => (
                                    <td>{val}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );

}

export default CsvPreview;