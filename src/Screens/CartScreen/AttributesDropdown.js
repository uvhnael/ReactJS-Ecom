import React, { useState, useEffect } from 'react';

const AttributesDropdown = ({ attributes, attributeValues, variants, setAttributeValues, handleUpdateCartItem }) => {

    const [clickedButton, setClickedButton] = useState([]);
    const [disabledButton, setDisabledButton] = useState([]);


    useEffect(() => {
        setDisabledButton(baseDisabledButton());
        // eslint-disable-next-line
    }, [variants]);

    useEffect(() => {
        setDisabledButton(updateDisabledButton(baseDisabledButton()));
        // eslint-disable-next-line
    }, [clickedButton]);

    const handleButtonClick = (attrIndex, valueIndex) => {
        const newClickedButton = [...clickedButton];
        newClickedButton[attrIndex] = newClickedButton[attrIndex] === valueIndex ? '' : valueIndex;
        setClickedButton(newClickedButton);

    };


    const baseDisabledButton = () => {
        const disabledButton = [];
        if (attributes.length === 0 || attributeValues.length === 0 || variants.length === 0) {
            return disabledButton;
        }

        if (attributes.length === 1) {
            for (let i = 0; i < attributeValues[0].length; i++) {
                if (variants[i].quantity <= 0) {
                    disabledButton.push(i);
                }
            }
        } else if (attributes.length === 2) {
            for (let i = 0; i < attributeValues[0].length; i++) {
                let disabled = true;
                for (let j = 0; j < attributeValues[1].length; j++) {
                    if (variants[i * attributeValues[1].length + j].quantity > 0) {
                        disabled = false;
                    }
                }
                if (disabled) {
                    disabledButton.push(i);
                }
            }
            for (let i = 0; i < attributeValues[1].length; i++) {
                let disabled = true;
                for (let j = 0; j < attributeValues[0].length; j++) {
                    if (variants[j * attributeValues[1].length + i].quantity > 0) {
                        disabled = false;
                    }
                }
                if (disabled) {
                    disabledButton.push(attributeValues[0].length + i);
                }
            }
        }

        return disabledButton;
    };

    const updateDisabledButton = (baseDisabledButton) => {
        const newDisabledButton = [...baseDisabledButton];

        if (attributes.length === 1 || attributes.length === 2) {
            return newDisabledButton;
        }
        if (clickedButton[0] !== undefined && clickedButton[0] !== '') {
            for (let i = 0; i < attributeValues[1].length; i++) {
                if (variants[clickedButton[0] * attributeValues[1].length + i].quantity <= 0) {
                    newDisabledButton.push(attributeValues[0].length + i);
                }
            }
        }
        if (clickedButton[1] !== undefined && clickedButton[1] !== '') {
            for (let i = 0; i < attributeValues[0].length; i++) {
                if (variants[i * attributeValues[1].length + clickedButton[1]].quantity <= 0) {
                    newDisabledButton.push(i);
                }
            }
        }

        return newDisabledButton;


    };

    const getAttributeValues = () => {
        var attribute_values = '';
        for (let i = 0; i < clickedButton.length; i++) {
            if (clickedButton[i] === '') {
                return;
            }
            attribute_values += attributeValues[i][clickedButton[i]];
            if (i < clickedButton.length - 1) {
                attribute_values += ', ';
            }
        }
        return attribute_values;
    };

    const getVariantId = () => {
        if (attributes.length === 1) {
            return variants[clickedButton[0]].id;
        } else if (attributes.length === 2) {
            return variants[clickedButton[0] * attributeValues[1].length + clickedButton[1]].id;
        }
    }

    const onButtonClick = () => {
        const attributeValues = getAttributeValues();
        setAttributeValues(attributeValues);
        const variantId = getVariantId()
        handleUpdateCartItem(variantId);
    }

    return (
        <div className="p-2 flex flex-col">
            {attributes.map((attr, attrIndex) => (
                <div key={attrIndex} className="flex flex-row mb-2 items-center">
                    <div className="w-24">
                        <p className="font-normal text-gray-600">{attr}</p>
                    </div>
                    <div className="flex flex-wrap py-1">
                        {attributeValues[attrIndex].map((value, valueIndex) => (
                            <button
                                key={valueIndex}
                                className={`px-3 py-1 rounded-lg mr-2 ${disabledButton.includes(attrIndex * attributeValues[0].length + valueIndex)
                                    ? 'text-gray-500 bg-gray-300 '
                                    : 'bg-gray-200 '
                                    } ${clickedButton[attrIndex] === valueIndex
                                        ? 'outline outline-2 outline-indigo-600'
                                        : ''
                                    }`}
                                onClick={() => handleButtonClick(attrIndex, valueIndex)}
                                disabled={disabledButton.includes(attrIndex * attributeValues[0].length + valueIndex)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <button
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                onClick={() => onButtonClick()}
            >
                Change
            </button>
        </div>
    );
}


export default AttributesDropdown;