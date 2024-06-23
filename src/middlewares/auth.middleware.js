import jwt from 'jsonwebtoken';
import User from '../../DB/Models/user.model.js';

export const auth = (accessRoles) => {
    return async (req, res, next) => {
        try {
            const { accesstoken } = req.headers;
            if (!accesstoken) {
                console.error('No access token found in headers');
                return next(new Error('please login first', { cause: 400 }));
            }

            try {
                const decodedData = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
                console.log('Decoded Data:', decodedData);

                if (!decodedData || !decodedData.id) {
                    console.error('Invalid token payload');
                    return next(new Error('invalid token payload', { cause: 400 }));
                }

                // User check
                const findUser = await User.findById(decodedData.id, 'username email role');
                if (!findUser) {
                    console.error('User not found');
                    return next(new Error('please signUp first', { cause: 404 }));
                }

                // Authorization
                if (!accessRoles.includes(findUser.role)) {
                    console.error('Unauthorized access');
                    return next(new Error('unauthorized', { cause: 401 }));
                }

                req.authUser = findUser;
                next();
            } catch (error) {
                console.error('Error verifying token:', error);
                return next(new Error('invalid token', { cause: 400 }));
            }
        } catch (error) {
            console.error('Error in auth middleware:', error);
            next(new Error('catch error in auth middleware', { cause: 500 }));
        }
    };
};
