import React, {useContext, useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useHttp } from '../hooks/http.hook';

export const CreatePage = () => {
    const [ link, setLink ] = useState('');
    const auth = useContext(AuthContext);
    const history = useHistory();
    const { request } = useHttp();

    useEffect(() => {
        window.M.updateTextFields();
    }, []);

    const handleChange = e => {
        setLink(e.target.value);
    };

    const handleEnterPress = async e => {
        if(e.key === 'Enter') {
            try {
                const data = await request(
                    '/api/link/generate', 
                    'POST', 
                    { from: link },
                    { authorization: `Bearer ${auth.token}` }
                );

                history.push(`/detail/${data.link._id}`);
            } catch (error) {
                
            };
        };    
    };

    return (
        <div className="row">
            <div className="col s8 offset-s2" style={{ paddingTop: '2rem'}}>
                <div className="input-field">
                    <input 
                        placeholder="Вставьте ссылку" 
                        id="link" 
                        type="text"
                        value={link}
                        onChange={handleChange}
                        onKeyPress={handleEnterPress}
                    />
                    <label htmlFor="link">Введите ссылку</label>
                </div>
            </div>
        </div>
    );
};