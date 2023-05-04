import React, { useState, useEffect } from 'react';
import './csvPreview.css';

function CsvPreview({ metadata }) {

    const [array, setArray] = useState([]);

    useEffect(() => {
        csvFileToArray(metadata)
    }, []);

    const csvFileToArray = string => {
        const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
        const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

        const array = csvRows.map(i => {
            const values = i.split(",");
            const obj = csvHeader.reduce((object, header, index) => {
                object[header] = values[index];
                return object;
            }, {});
            return obj;
        });

        setArray(array);
    };

    const headerKeys = Object.keys(Object.assign({}, ...array));

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Metadata </h2>
            <div className='table-container'>
                <table>
                    <thead>
                        <tr key={"header"}>
                            {headerKeys.map((key) => (
                                <th>{key}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {array.map((item) => (
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